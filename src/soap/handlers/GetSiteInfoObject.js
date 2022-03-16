const { Readable } = require('stream')
const { CacheControls, ContentTypes, Headers } = require('../../lib/utils')
const {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
} = require('../serializers/query')
const {
  seriesStart,
  seriesEnd,
  seriesCatalogStart,
  seriesCatalogEnd
} = require('../serializers/series')
const {
  siteStart,
  siteEnd,
  siteInfoStart,
  siteInfoEnd,
  siteInfoType,
  sitesResponseStart,
  sitesResponseEnd
} = require('../serializers/site')
const {
  soapBodyStart,
  soapBodyEnd,
  soapEnvelopeStart,
  soapEnvelopeEnd
} = require('../serializers/common')
const {
  variableStart,
  variableEnd,
  variableInfoType
} = require('../serializers/variable')

async function* getSiteInfoObject(
  request,
  { helpers, logger, method, parameters, webAPI }
) {
  const { site } = parameters
  const stationId = site.split(':')[1]

  if (!stationId) throw new Error(`Invalid site parameter: ${site}`)

  // Fetch station
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

  // Fetch datastreams for station
  const datastreamsResp = await webAPI.get(`/datastreams`, {
    params: {
      is_enabled: true,
      is_hidden: false,
      station_id: stationId,
      // TODO: Paginate to allow for more than 2000
      $limit: 2000
    }
  })
  const datastreams =
    (datastreamsResp.data &&
      datastreamsResp.data.data &&
      datastreamsResp.data.data.filter(datastream => datastream.terms.odm)) ||
    []

  const unitCV = await helpers.getUnitCV()
  const variableCV = await helpers.getVariableCV()

  yield soapEnvelopeStart() +
    soapBodyStart() +
    '<GetSiteInfoObjectResponse xmlns="http://www.cuahsi.org/his/1.1/ws/">' +
    sitesResponseStart() +
    queryInfoStart() +
    queryInfoType({ method, parameters }) +
    queryInfoEnd() +
    siteStart() +
    siteInfoStart() +
    siteInfoType({ station: stationResp.data }) +
    siteInfoEnd() +
    seriesCatalogStart()

  for (const datastream of datastreams) {
    yield seriesStart() +
      variableStart() +
      variableInfoType({ datastream, unitCV, variableCV }) +
      variableEnd() +
      seriesEnd()
  }

  yield seriesCatalogEnd() +
    siteEnd() +
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
