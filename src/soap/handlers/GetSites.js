import { encodeXML } from 'entities'
import { Readable } from 'stream'
import { CacheControls, ContentTypes, Headers } from '../../lib/utils.js'
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
  soapEnvelopeEnd
} from '../serializers/common.js'

async function* getSites(request, { helpers, method, parameters }) {
  const { site } = parameters
  const sites =
    site &&
    typeof site === 'object' &&
    typeof site.string === 'string' &&
    site.string > ''
      ? [site.string]
      : site && typeof site === 'object' && Array.isArray(site.string)
      ? site.string
      : []

  // Fetch stations
  const stations = await helpers.findMany(
    'stations',
    Object.assign(
      {
        is_enabled: true,
        is_hidden: false,
        // TODO: Paginate to allow for more than 2000
        // TODO: Sort!
        $limit: 2000
      },
      request.params && request.params.org
        ? { organization_id: await helpers.orgId(request.params.org) }
        : undefined,
      sites.length
        ? { _id: { $in: sites.map(str => str.split(':')[1]) } }
        : undefined
    )
  )

  yield soapEnvelopeStart() +
    soapBodyStart() +
    responseStart('GetSitesResponse') +
    '<GetSitesResult>' +
    encodeXML(
      sitesResponseStart() +
        queryInfoStart() +
        queryInfoType({
          method,
          parameters: [
            ['authToken', parameters.authToken],
            ...sites.map(str => ['site', str])
          ]
        }) +
        queryInfoEnd()
    )

  for (const station of stations) {
    yield encodeXML(
      siteStart() +
        siteInfoStart() +
        siteInfoType({ station }) +
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
  reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getSites(request, ctx), {
        autoDestroy: true
      })
    )
}
