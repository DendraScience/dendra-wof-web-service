import { encodeXML } from 'entities'
import { Readable } from 'stream'
import { CacheControls, ContentTypes, Headers, uuid } from '../../lib/utils.js'
import {
  queryInfoStart,
  queryInfoEnd,
  queryInfoNote,
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
  soapWsseSecurityStart,
  soapWsuTimestampStart,
  soapWsuInfo,
  soapWsuTimestampEnd,
  soapWsseSecurityEnd,
  soapHeaderEnd
} from '../serializers/common.js'

export async function* getSites(
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
  const organization = org
    ? await helpers.findMany('organizations', {
        slug: helpers.slugify(org),
        $limit: 1
      })
    : undefined

  const stationParams = Object.assign(
    {
      is_enabled: true,
      state: 'ready',
      $limit: 2000,
      $sort: { _id: 1 }
    },
    organization && organization.length && organization[0]._id
      ? { organization_id: organization[0]._id }
      : undefined,
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

  // Fetch stations
  let stations = await helpers.findMany('stations', stationParams)

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetSitesResponse') +
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
    responseStart('GetSitesResponse') +
    '<GetSitesResult>' +
    encodeXML(
      sitesResponseStart({ isObject: false }) +
        queryInfoStart() +
        queryInfoType({
          date,
          method,
          parameters: [...sites.map(str => ['site', str])]
        }) +
        queryInfoNote({
          note: 'ALL Sites(empty request)',
          visible: !sites.length
        }) +
        queryInfoEnd()
    )

  while (stations.length) {
    let i = 0

    for (const station of stations) {
      const refsMap = helpers.externalRefsMap(station.external_refs)

      yield encodeXML(
        siteStart() +
          siteInfoStart() +
          siteInfoType({ refsMap, station }) +
          siteInfoEnd() +
          siteEnd()
      )

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

  yield encodeXML(sitesResponseEnd()) +
    '</GetSitesResult>' +
    '</GetSitesResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getSites(request, ctx), {
        autoDestroy: true
      })
    )
}
