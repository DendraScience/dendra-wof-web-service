import { Readable } from 'stream'
import { encodeXML } from 'entities'
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
  getSiteInfoResultStart,
  siteStart,
  siteEnd,
  siteInfoStart,
  siteInfoEnd,
  siteInfoType,
  sitesResponseStart,
  sitesResponseEnd,
  getSiteInfoResultEnd
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

export async function* getSiteInfo(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
) {
  const { site } = parameters
  const parts = site && site.split(':')
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
        is_hidden: false
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
    soapWsaAction('GetSiteInfoResponse') +
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
    responseStart('GetSiteInfoResponse') +
    getSiteInfoResultStart() +
    encodeXML(
      sitesResponseStart({ isObject: false }) +
        queryInfoStart() +
        queryInfoType({
          date,
          method,
          parameters: [['site', (org || parts[0]) + ':' + parts[1]]]
        }) +
        queryInfoEnd() +
        siteStart()
    )

  for (const station of stations) {
    const externalRefs = station.external_refs
      ? helpers.externalRefs(station.external_refs)
      : undefined

    yield encodeXML(
      siteInfoStart() + siteInfoType({ externalRefs, station }) + siteInfoEnd()
    )
  }

  yield encodeXML(seriesCatalogStart())

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

        yield encodeXML(
          seriesStart() +
            variableStart() +
            variableInfoType({ datastream, refsMap, unitCV }) +
            variableEnd() +
            valueCount({ refsMap }) +
            variableTimeInterval({ firstDatapoint, lastDatapoint, refsMap }) +
            seriesMethod({ refsMap }) +
            seriesSource({ refsMap }) +
            qualityControlLevelInfo({ refsMap }) +
            seriesEnd()
        )
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

  yield encodeXML(seriesCatalogEnd() + siteEnd())

  yield encodeXML(sitesResponseEnd()) +
    getSiteInfoResultEnd() +
    '</GetSiteInfoResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getSiteInfo(request, ctx), {
        autoDestroy: true
      })
    )
}
