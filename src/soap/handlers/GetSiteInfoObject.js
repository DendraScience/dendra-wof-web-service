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

export async function* getSiteInfoObject(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
) {
  const { site } = parameters
  const parts = (site && site.split(':')) || []
  const org =
    typeof request.params.org === 'string'
      ? helpers.org(request.params.org)
      : undefined

  // Fetch organization
  const organization = org
    ? await helpers.findOneCached('organizations', '', {
        slug: helpers.safeName(org)
      })
    : undefined

  // Fetch stations
  const stations = await helpers.findMany(
    'stations',
    Object.assign(
      {
        is_enabled: true,
        is_hidden: false,
        $limit: 1
      },
      organization &&
        organization.data &&
        organization.data.length &&
        organization.data[0]._id
        ? { organization_id: organization.data[0]._id }
        : undefined,
      site
        ? {
            slug: {
              $in: [(org || parts[0] || '-') + '-' + (parts[1] || '-')]
            }
          }
        : undefined
    )
  )

  if (!stations.length) throw new Error('Station not found')

  // Fetch datastreams for station
  const datastreamsParams = Object.assign(
    {
      is_enabled: true,
      is_hidden: false,
      $limit: 2000,
      $sort: { _id: 1 }
    },
    organization &&
      organization.data &&
      organization.data.length &&
      organization.data[0]._id
      ? { organization_id: organization.data[0]._id }
      : undefined
  )

  let datastreams = await helpers.findMany('datastreams', datastreamsParams)

  const unitCV = await helpers.getUnitCV()

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetSiteInfoObjectResponse') +
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
    responseStart('GetSiteInfoObjectResponse ') +
    sitesResponseStart({ isObject: true }) +
    queryInfoStart() +
    queryInfoType({
      date,
      method,
      parameters: [['site', (org || parts[0]) + ':' + parts[1]]]
    }) +
    queryInfoEnd() +
    siteStart()

  // Will only be one station since $limit=1
  for (const station of stations) {
    const refsMap = station.external_refs
      ? helpers.externalRefsMap(station.external_refs)
      : undefined

    yield siteInfoStart() + siteInfoType({ refsMap, station }) + siteInfoEnd()
  }

  if (datastreams && datastreams.length) {
    yield seriesCatalogStart(org || parts[0])
  }

  const variableCodes = new Set()

  while (datastreams.length) {
    let i = 0

    for (const datastream of datastreams) {
      const refsMap =
        datastream && datastream.external_refs
          ? helpers.externalRefsMap(datastream.external_refs)
          : undefined
      const variableCode =
        refsMap && refsMap.get('his.odm.variables.VariableCode')

      // Normalize datastreams to unique variables
      if (variableCode && !variableCodes.has(variableCode)) {
        variableCodes.add(variableCode)

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

        yield seriesStart() +
          variableStart() +
          variableInfoType({ datastream, refsMap, unitCV }) +
          variableEnd() +
          valueCount({ refsMap }) +
          variableTimeInterval({ firstDatapoint, lastDatapoint, refsMap }) +
          seriesMethod({ refsMap }) +
          seriesSource({ refsMap }) +
          qualityControlLevelInfo({ refsMap }) +
          seriesEnd()
      }

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

  if (variableCodes.size || (datastreams && datastreams.length)) {
    yield seriesCatalogEnd()
  }

  yield siteEnd() +
    sitesResponseEnd() +
    '</GetSiteInfoObjectResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getSiteInfoObject(request, ctx), {
        autoDestroy: true
      })
    )
}
