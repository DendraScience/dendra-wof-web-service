import { encodeXML } from 'entities'
import { Readable } from 'stream'
import { CacheControls, ContentTypes, Headers } from '../../lib/utils.js'
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
  variableTimeInterval
} from '../serializers/series.js'
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
import {
  variableStart,
  variableEnd,
  variableInfoType
} from '../serializers/variable.js'

async function* getSiteInfo(_request, { helpers, method, parameters }) {
  const { site } = parameters
  const stationId = site.split(':')[1]

  if (!stationId) throw new Error(`Invalid site parameter: ${site}`)

  // Fetch station and org
  const station = await helpers.findOne('stations', stationId, {
    is_enabled: true,
    is_hidden: false
  })
  const organization = await helpers.findOneCached(
    'organizations',
    station.organization_id
  )

  // Fetch datastreams for station
  const datastreams = (
    await helpers.findMany('datastreams', {
      is_enabled: true,
      is_hidden: false,
      station_id: stationId,
      // TODO: Paginate to allow for more than 2000
      // TODO: Sort!
      $limit: 2000
    })
  ).filter(datastream => datastream.terms.odm)

  const unitCV = await helpers.getUnitCV()
  const variableCV = await helpers.getVariableCV()

  yield soapEnvelopeStart() +
    soapBodyStart() +
    responseStart('GetSiteInfoResponse') +
    '<GetSiteInfoResult>' +
    encodeXML(
      sitesResponseStart() +
        queryInfoStart() +
        queryInfoType({ method, parameters: Object.entries(parameters) }) +
        queryInfoEnd() +
        siteStart() +
        siteInfoStart() +
        siteInfoType({ station }) +
        siteInfoEnd() +
        seriesCatalogStart()
    )

  for (const datastream of datastreams) {
    const firstDatapoint = await helpers.findDatapoint({
      datastream_id: datastream._id
    })
    const lastDatapoint = await helpers.findDatapoint(
      { datastream_id: datastream._id },
      true
    )
    let thingType
    if (datastream.thing_type_id)
      thingType = await helpers.findOneCached(
        'thing-types',
        datastream.thing_type_id,
        { is_enabled: true }
      )

    yield encodeXML(
      seriesStart() +
        variableStart() +
        variableInfoType({ datastream, unitCV, variableCV }) +
        variableEnd() +
        valueCount({ datastream, firstDatapoint, lastDatapoint }) +
        variableTimeInterval({ firstDatapoint, lastDatapoint }) +
        seriesMethod({ thingType }) +
        seriesSource({ organization }) +
        seriesEnd()
    )
  }

  yield encodeXML(seriesCatalogEnd() + siteEnd() + sitesResponseEnd()) +
    '</GetSiteInfoResult>' +
    '</GetSiteInfoResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getSiteInfo(request, ctx), {
        autoDestroy: true
      })
    )
}
