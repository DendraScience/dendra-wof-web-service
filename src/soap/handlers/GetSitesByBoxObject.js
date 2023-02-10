import { Readable } from 'stream'
import { CacheControls, ContentTypes, Headers, uuid } from '../../lib/utils.js'
import {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
} from '../serializers/query.js'
import {
  siteStart,
  siteEnd,
  siteInfoStart,
  siteInfoEnd,
  siteInfoType,
  sitesResponseStart,
  sitesResponseEnd
} from '../serializers/site.js'
import {
  seriesMethod,
  seriesSource,
  seriesStart,
  seriesEnd,
  seriesCatalogStart,
  seriesCatalogEnd,
  valueCount,
  variableTimeInterval,
  qualityControlLevelInfo
} from '../serializers/series.js'
import {
  variableStart,
  variableInfoType,
  variableEnd
} from '../serializers/variable.js'
import {
  responseStart,
  soapBodyStart,
  soapBodyEnd,
  soapEnvelopeStart,
  soapEnvelopeEnd,
  soapHeaderStart,
  soapWsaAction,
  soapWsaMessageID,
  soapWsaRelatesTo,
  soapWsaTo,
  soapWsuInfo,
  soapWsseSecurityStart,
  soapWsseSecurityEnd,
  soapWsuTimestampStart,
  soapWsuTimestampEnd,
  soapHeaderEnd
} from '../serializers/common.js'
import { genDatastreams } from '../../lib/datastream.js'

export async function* getSitesByBoxObject(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
) {
  const { north, south, east, west, IncludeSeries } = parameters

  const org =
    typeof request.params.org === 'string'
      ? helpers.org(request.params.org)
      : undefined

  // Fetch organization
  let organization
  if (org) {
    const organizations = await helpers.findMany('organizations', {
      slug: helpers.slugify(org),
      $limit: 1
    })
    if (!organizations.length) throw new Error('Organization not found')
    organization = organizations[0]
  }

  const stationParams = Object.assign(
    {
      is_enabled: true,
      state: 'ready',
      $limit: 2000,
      $sort: { _id: 1 }
    },
    organization ? { organization_id: organization._id } : undefined,
    {
      'geo.coordinates.0': { $gte: parseFloat(west), $lte: parseFloat(east) },
      'geo.coordinates.1': { $gte: parseFloat(south), $lte: parseFloat(north) }
    }
  )

  // Fetch stations
  let stations = await helpers.findMany('stations', stationParams)

  if (!stations.length) throw new Error('Station not found')

  const unitCV = IncludeSeries ? await helpers.getUnitCV() : undefined
  const organizationRefsMap =
    organization && organization.external_refs
      ? helpers.externalRefsMap(organization.external_refs)
      : undefined

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetSitesByBoxObjectResponse') +
    soapWsaMessageID(uniqueid || uuid()) +
    soapWsaRelatesTo(uniqueid || uuid()) +
    soapWsaTo() +
    soapWsseSecurityStart() +
    soapWsuTimestampStart(uniqueid || uuid()) +
    soapWsuInfo({ date }) +
    soapWsuTimestampEnd() +
    soapWsseSecurityEnd() +
    soapHeaderEnd() +
    soapBodyStart() +
    responseStart('GetSitesByBoxObjectResponse') +
    sitesResponseStart({ isObject: true }) +
    queryInfoStart() +
    queryInfoType({
      date,
      method,
      parameters: [
        ['north', north],
        ['south', south],
        ['east', east],
        ['west', west],
        ['includeSeries', IncludeSeries ? 'True' : 'False']
      ]
    }) +
    queryInfoEnd()

  while (stations.length) {
    let i = 0

    for (const station of stations) {
      const refsMap = helpers.externalRefsMap(station.external_refs)

      yield siteStart() +
        siteInfoStart() +
        siteInfoType({ organizationRefsMap, refsMap, station }) +
        siteInfoEnd()

      if (IncludeSeries) {
        const datastreamsParams = Object.assign(
          {
            is_enabled: true,
            state: 'ready',
            station_id: station._id,
            $limit: 2000,
            $sort: { _id: 1 }
          },
          organization ? { organization_id: organization._id } : undefined
        )
        const datastreams = await genDatastreams({
          helpers,
          params: datastreamsParams
        })

        let datastream = await datastreams.next()

        // Datastreams set for open and closing tag of seriesCatalog
        const hasDatastream = !!(datastream && datastream.value)

        if (hasDatastream) {
          yield seriesCatalogStart({ isLocalService: true, org })
        }

        while (!datastream.done) {
          const datastreamValue = datastream.value
          const refsMap =
            datastreamValue && datastreamValue.external_refs
              ? helpers.externalRefsMap(datastreamValue.external_refs)
              : undefined

          const firstDatapoint = await helpers.findDatapoint({
            datastream_id: datastreamValue._id
          })
          let lastDatapoint

          if (firstDatapoint) {
            lastDatapoint = await helpers.findDatapoint(
              { datastream_id: datastreamValue._id },
              true
            )
          }

          const datapoints = await helpers.findMany('datapoints', {
            datastream_id: datastreamValue._id,
            fn: 'count'
          })
          const vCount =
            datapoints &&
            datapoints.reduce((total, datapoint) => {
              return total + datapoint.v
            }, 0)

          yield seriesStart() +
            variableStart() +
            variableInfoType({
              datastream: datastreamValue,
              organizationRefsMap,
              refsMap,
              unitCV
            }) +
            variableEnd() +
            valueCount(vCount) +
            variableTimeInterval({ firstDatapoint, lastDatapoint, refsMap }) +
            seriesMethod({ refsMap }) +
            seriesSource({ refsMap }) +
            qualityControlLevelInfo({ refsMap }) +
            seriesEnd()

          datastream = await datastreams.next()
        }

        if (hasDatastream) {
          yield seriesCatalogEnd()
        }
      }

      yield siteEnd()

      // Stay async friendly; scan 200 at a time (hardcoded)
      i++
      if (!(i % 200)) await new Promise(resolve => setImmediate(resolve))
    }

    // Fetch next page
    stations = await helpers.findMany(
      'stations',
      Object.assign(
        {
          _id: { $gt: stations[stations.length - 1]._id }
        },
        stationParams
      )
    )
  }

  yield sitesResponseEnd() +
    '</GetSitesByBoxObjectResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getSitesByBoxObject(request, ctx), {
        autoDestroy: true
      })
    )
}
