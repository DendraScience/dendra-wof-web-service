import { Readable } from 'stream'
import { CacheControls, ContentTypes, Headers, uuid } from '../../lib/utils.js'
import {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
} from '../serializers/query.js'
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
  siteStart,
  siteEnd,
  siteInfoStart,
  siteInfoEnd,
  siteInfoType,
  sitesResponseStart,
  sitesResponseEnd
} from '../serializers/site.js'
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

export async function* getSiteInfoMultpleObject(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
) {
  const { site } = parameters
  const sites =
    site &&
    typeof site === 'object' &&
    typeof site.string === 'string' &&
    site.string > ''
      ? [site.string]
      : site && typeof site === 'object' && Array.isArray(site.string)
      ? site.string.filter(str => !!str)
      : []

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

  // Fetch stations
  const stations = await helpers.findMany(
    'stations',
    Object.assign(
      {
        is_enabled: true,
        state: 'ready',
        $limit: 2000
      },
      organization ? { organization_id: organization._id } : undefined,
      sites.length
        ? {
            slug: {
              $in: sites.map(str => {
                const parts = str.split(':')
                return helpers.slugify(
                  (org || parts[0] || '-') + '-' + (parts[1] || '-')
                )
              })
            }
          }
        : undefined
    )
  )

  if (!stations.length) throw new Error('Station not found')

  const unitCV = await helpers.getUnitCV()

  const organizationRefsMap =
    organization && organization.external_refs
      ? helpers.externalRefsMap(organization.external_refs)
      : undefined

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetSiteInfoMultpleObjectResponse') +
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
    responseStart('GetSiteInfoMultpleObjectResponse') +
    sitesResponseStart({ isObject: true }) +
    queryInfoStart() +
    queryInfoType({
      date,
      method,
      parameters: [...sites.map(str => ['site', str])]
    }) +
    queryInfoEnd()

  // Will only be one station since $limit=1
  for (const station of stations) {
    const refsMap = station.external_refs
      ? helpers.externalRefsMap(station.external_refs)
      : undefined

    yield siteStart() +
      siteInfoStart() +
      siteInfoType({ organizationRefsMap, refsMap, station }) +
      siteInfoEnd()

    // Fetch datastreams for station
    const datastreamsParams = Object.assign(
      {
        is_enabled: true,
        state: 'ready',
        station_id: stations[0]._id,
        $limit: 2000,
        $sort: { _id: 1 }
      },
      organization ? { organization_id: organization._id } : undefined
    )

    let datastreams = await helpers.findMany('datastreams', datastreamsParams)

    // Datastreams length set for open and closing tag of seriesCatalog
    const datastreamLength = datastreams && datastreams.length

    if (datastreamLength) {
      yield seriesCatalogStart(org)
    }

    while (datastreams.length) {
      let i = 0

      for (const datastream of datastreams) {
        const refsMap =
          datastream && datastream.external_refs
            ? helpers.externalRefsMap(datastream.external_refs)
            : undefined

        const firstDatapoint = await helpers.findDatapoint({
          datastream_id: datastream._id
        })
        let lastDatapoint

        if (firstDatapoint) {
          lastDatapoint = await helpers.findDatapoint(
            { datastream_id: datastream._id },
            true
          )
        }

        const datapoints = await helpers.findMany('datapoints', {
          datastream_id: datastream._id,
          fn: 'count'
        })
        const vCount =
          datapoints &&
          datapoints.reduce((total, datapoint) => {
            return total + datapoint.v
          }, 0)

        yield seriesStart() +
          variableStart() +
          variableInfoType({ datastream, refsMap, unitCV }) +
          variableEnd() +
          valueCount(vCount) +
          variableTimeInterval({ firstDatapoint, lastDatapoint, refsMap }) +
          seriesMethod({ refsMap }) +
          seriesSource({ refsMap }) +
          qualityControlLevelInfo({ refsMap }) +
          seriesEnd()

        // Stay async friendly; scan 200 at a time (hardcoded)
        i++
        if (!(i % 200)) await new Promise(resolve => setImmediate(resolve))
      }

      // Fetch next page
      datastreams = await helpers.findMany(
        'datastreams',
        Object.assign(
          {
            _id: { $gt: datastreams[datastreams.length - 1]._id }
          },
          datastreamsParams
        )
      )
    }

    if (datastreamLength) {
      yield seriesCatalogEnd()
    }
    yield siteEnd()
  }

  yield sitesResponseEnd() +
    '</GetSiteInfoMultpleObjectResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getSiteInfoMultpleObject(request, ctx), {
        autoDestroy: true
      })
    )
}
