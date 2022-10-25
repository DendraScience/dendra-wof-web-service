import { Readable } from 'stream'
import { CacheControls, ContentTypes, Headers, uuid } from '../../lib/utils.js'
import {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
} from '../serializers/query.js'
import { siteInfoType } from '../serializers/site.js'
import {
  responseWaterMLStart,
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
import {
  variableStart,
  variableInfoType,
  variableEnd
} from '../serializers/variable.js'
import {
  timeSeriesResponseStart,
  timeSeriesStart,
  sourceInfoStart,
  valuesStart,
  valuesEnd,
  valueInfoType,
  sourceInfoEnd,
  censorCodeInfo,
  timeSeriesEnd,
  timeSeriesResponseEnd
} from '../serializers/value.js'
import {
  qualityControlLevelInfo,
  seriesMethod,
  seriesSource
} from '../serializers/series.js'

export async function* getValuesObject(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
) {
  const { location, variable, startDate, endDate } = parameters
  const siteParts = location && location.split(':')
  const variableParts = variable && variable.split(':')

  const startDateValue = helpers.dateformater(startDate)
  const endDateValue = helpers.dateformater(endDate)

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
  const stationParams = Object.assign(
    {
      is_enabled: true,
      state: 'ready',
      $limit: 1
    },
    organization ? { organization_id: organization._id } : undefined,
    siteParts
      ? {
          slug: helpers.slugify(
            (org || siteParts[0] || '-') + '-' + (siteParts[1] || '-')
          )
        }
      : undefined
  )
  // Fetch stations
  const stations = await helpers.findMany('stations', stationParams)
  if (!stations.length) throw new Error('Station not found')

  // Fetch datastreams
  const datastreamsParams = Object.assign(
    {
      is_enabled: true,
      state: 'ready',
      station_id: stations[0]._id,
      $limit: 2000,
      $sort: { _id: 1 }
    },
    organization ? { organization_id: organization._id } : undefined,
    variableParts
      ? {
          'external_refs.type': 'his.odm.variables.VariableCode',
          'external_refs.identifier': variableParts[1]
        }
      : undefined
  )
  let datastreams = await helpers.findMany('datastreams', datastreamsParams)

  if (!datastreams.length) throw new Error('Datastreams not found')

  const unitCV = await helpers.getUnitCV()

  const dataStreamRefsMap = datastreams[0].external_refs
    ? helpers.externalRefsMap(datastreams[0].external_refs)
    : undefined

  const stationRefsMap = stations[0].external_refs
    ? helpers.externalRefsMap(stations[0].external_refs)
    : undefined

  const organizationRefsMap =
    organization && organization.external_refs
      ? helpers.externalRefsMap(organization.external_refs)
      : undefined

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetSitesObjectResponse') +
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
    responseWaterMLStart('TimeSeriesResponse') +
    timeSeriesResponseStart() +
    queryInfoStart() +
    queryInfoType({
      date,
      method,
      parameters: [
        ['site', location || undefined],
        ['variable', variable || undefined]
      ]
    }) +
    queryInfoEnd() +
    timeSeriesStart()

  // Will only be one station since $limit=1
  for (const station of stations) {
    yield sourceInfoStart() +
      siteInfoType({ organizationRefsMap, refsMap: stationRefsMap, station }) +
      sourceInfoEnd()
  }

  yield variableStart() +
    variableInfoType({
      datastream: datastreams[0],
      refsMap: dataStreamRefsMap,
      unitCV
    }) +
    variableEnd()

  yield valuesStart()

  const qualityControlLevelCodes = new Map()
  const methodIds = new Map()
  const sourceIDs = new Map()

  while (datastreams.length) {
    let i = 0

    for (const datastream of datastreams) {
      const refsMap =
        datastream && datastream.external_refs
          ? helpers.externalRefsMap(datastream.external_refs)
          : undefined
      const qualityControlLevelCode =
        refsMap &&
        refsMap.get('his.odm.qualitycontrollevels.QualityControlLevelCode')
      const methodId = refsMap.get('his.odm.methods.MethodID')
      const sourceID = refsMap.get('his.odm.sources.SourceID')

      const datapointsParams = Object.assign({
        datastream_id: datastream._id,
        time: {
          $gte: startDateValue,
          $lte: endDateValue
        },
        time_local: true,
        t_int: true,
        $limit: 260,
        $sort: {
          time: 1
        }
      })

      let datapoints = await helpers.findMany('datapoints', datapointsParams)
      while (datapoints.length) {
        let j = 0
        for (const datapoint of datapoints) {
          yield valueInfoType({
            datapoint,
            methodId,
            sourceID,
            qualityControlLevelCode
          })
          // Stay async friendly; scan 200 at a time (hardcoded)
          j++
          if (!(j % 200)) await new Promise(resolve => setImmediate(resolve))
        }
        //
        datapoints = await helpers.findMany(
          'datapoints',
          Object.assign(datapointsParams, {
            time: {
              $gt: datapoints[datapoints.length - 1].lt,
              $lte: endDateValue
            }
          })
        )
      }

      if (
        qualityControlLevelCode &&
        !qualityControlLevelCodes.has(qualityControlLevelCode)
      ) {
        qualityControlLevelCodes.set(qualityControlLevelCode, refsMap)
      }

      if (methodId && !methodIds.has(methodId)) {
        methodIds.set(methodId, refsMap)
      }

      if (sourceID && !sourceIDs.has(sourceID)) {
        sourceIDs.set(sourceID, refsMap)
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

  for (const value of qualityControlLevelCodes.values()) {
    yield qualityControlLevelInfo({
      hasExplanation: true,
      refsMap: value
    })
  }

  for (const value of methodIds.values()) {
    yield seriesMethod({
      hasMethodCode: true,
      refsMap: value
    })
  }

  for (const value of sourceIDs.values()) {
    yield seriesSource({
      hasSourceCode: true,
      refsMap: value
    }) + censorCodeInfo({ censorCode: 'n', censorCodeDescription: 'xyz' })
  }

  yield valuesEnd()

  yield timeSeriesEnd() +
    timeSeriesResponseEnd() +
    '</TimeSeriesResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getValuesObject(request, ctx), {
        autoDestroy: true
      })
    )
}