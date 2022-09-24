import { encodeXML } from 'entities'
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
        // TODO: Paginate to allow for more than 2000
        $limit: 2000,
        $sort: { _id: 1 }
      },
      organization &&
        organization.data &&
        organization.data.length &&
        organization.data[0]._id
        ? { organization_id: organization.data[0]._id }
        : undefined,
      sites.length
        ? {
            slug: {
              $in: sites.map(str => {
                const parts = str.split(':')
                return helpers.safeName(
                  (org || parts[0] || '-') + '-' + (parts[1] || '-')
                )
              })
            }
          }
        : undefined
    )
  )

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
      sitesResponseStart() +
        queryInfoStart() +
        queryInfoType({
          date,
          method,
          parameters: [
            ['authToken', parameters.authToken],
            ...sites.map(str => ['site', str])
          ]
        }) +
        queryInfoEnd()
    )

  for (const station of stations) {
    const externalRefs = helpers.externalRefs(station.external_refs)
    yield encodeXML(
      siteStart() +
        siteInfoStart() +
        siteInfoType({ externalRefs, station }) +
        siteInfoEnd() +
        siteEnd()
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
