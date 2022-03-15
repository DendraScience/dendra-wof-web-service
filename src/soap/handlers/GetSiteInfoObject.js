const { Readable } = require('stream')
const { CacheControls, ContentTypes, Headers } = require('../../lib/utils')
const {
  soapBodyStart,
  soapBodyEnd,
  soapEnvelopeStart,
  soapEnvelopeEnd
} = require('../serializers/common')
const {
  siteStart,
  siteEnd,
  sitesResponseStart,
  sitesResponseEnd,
  siteInfo
} = require('../serializers/site')
const { queryInfo } = require('../serializers/query')

async function* getSiteInfoObject(
  request,
  { logger, method, parameters, webAPI }
) {
  const { site } = parameters
  const stationId = site.split(':')[1]

  if (!stationId) throw new Error(`Invalid site parameter: ${site}`)

  let stationResp
  try {
    stationResp = await webAPI.get(`/stations/${stationId}`, {
      params: { is_enabled: true, is_hidden: false }
    })
  } catch (err) {
    if (err.response && err.response.status === 404)
      throw new Error(`Station id not found: ${stationId}`)
    else throw err
  }

  yield soapEnvelopeStart() +
    soapBodyStart() +
    '<GetSiteInfoObjectResponse xmlns="http://www.cuahsi.org/his/1.1/ws/">' +
    sitesResponseStart() +
    queryInfo({ method, parameters }) +
    siteStart() +
    siteInfo({ station: stationResp.data })

  // TODO: for yield seriesCatalog({datastream})

  yield siteEnd() +
    sitesResponseEnd() +
    '</GetSiteInfoObjectResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

module.exports = async (request, reply, ctx) => {
  reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getSiteInfoObject(request, ctx), {
        autoDestroy: true
      })
    )
}
