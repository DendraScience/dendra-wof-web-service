import { Readable } from 'stream'
import { CacheControls, ContentTypes, Headers, uuid } from '../../lib/utils.js'
import {
  soapEnvelopeStart,
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
  soapHeaderEnd,
  soapBodyStart,
  responseStart,
  soapBodyEnd,
  soapEnvelopeEnd
} from '../serializers/common.js'
import {
  queryInfoStart,
  queryInfoType,
  queryInfoEnd
} from '../serializers/query.js'
import {
  timeSeriesResponseStart,
  timeSeriesStart,
  sourceInfoStart,
  sourceInfoEnd,
  valuesStart,
  valueInfoType,
  valuesEnd,
  censorCodeInfo,
  timeSeriesEnd,
  timeSeriesResponseEnd
} from '../serializers/value.js'
import { siteInfoType } from '../serializers/site.js'
import {
  qualityControlLevelInfo,
  seriesMethod,
  seriesSource
} from '../serializers/series.js'
import {
  variableStart,
  variableInfoType,
  variableEnd
} from '../serializers/variable.js'
import { getVariables } from '../../lib/variable.js'

export async function* getValuesForASiteObject(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
) {
  const { endDate, site, startDate } = parameters
  const siteParts = site && site.split(':')
  const startTime = helpers.toTime(startDate)
  const endTime = helpers.toTime(endDate)

  // Check for Invalid Date
  if (startDate && !startTime) {
    throw new Error(`Invalid startDate parameter '${startDate}'`)
  }
  if (endDate && !endTime) {
    throw new Error(`Invalid endDate parameter '${endDate}'`)
  }

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
  const stations = await helpers.findMany('stations', stationParams)

  if (!stations.length) throw new Error('Station not found')

  // Station Template
  const station = stations[0]

  // Fetch datastreams
  const datastreamsParams = Object.assign(
    {
      is_enabled: true,
      state: 'ready',
      station_id: station._id,
      $limit: 2000,
      $sort: { _id: 1 }
    },
    organization ? { organization_id: organization._id } : undefined
  )

  // datastream grouped by variableCode
  const datastreams = await getVariables({
    helpers,
    params: datastreamsParams
  })

  const unitCV = await helpers.getUnitCV()

  const organizationRefsMap =
    organization && organization.external_refs
      ? helpers.externalRefsMap(organization.external_refs)
      : undefined
  const stationRefsMap = station.external_refs
    ? helpers.externalRefsMap(station.external_refs)
    : undefined

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetValuesForASiteObjectResponse') +
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
    responseStart('GetValuesForASiteObjectResponse') +
    timeSeriesResponseStart({ hasAttribute: false, isSiteObject: true }) +
    queryInfoStart() +
    queryInfoType({
      date,
      method,
      parameters: [
        ['site', site || undefined],
        startDate ? ['startDate', startDate] : undefined,
        endDate ? ['endDate', endDate] : undefined
      ]
    }) +
    queryInfoEnd()

  if (datastreams && datastreams.size) {
    for (const datastream of datastreams.values()) {
      const refsMap =
        datastream && datastream[0].external_refs
          ? helpers.externalRefsMap(datastream[0].external_refs)
          : undefined

      yield timeSeriesStart() +
        sourceInfoStart() +
        siteInfoType({
          organizationRefsMap,
          refsMap: stationRefsMap,
          station
        }) +
        sourceInfoEnd() +
        variableStart() +
        variableInfoType({
          datastream: datastream[0],
          organizationRefsMap,
          refsMap,
          unitCV
        }) +
        variableEnd()

      yield valuesStart()

      const qualityControlLevelCodes = new Map()
      const methodIDs = new Map()
      const sourceIDs = new Map()

      for (const data of datastream) {
        const dataRefsMap =
          data && data.external_refs
            ? helpers.externalRefsMap(data.external_refs)
            : undefined
        const qualityControlLevelCode =
          dataRefsMap &&
          dataRefsMap.get(
            'his.odm.qualitycontrollevels.QualityControlLevelCode'
          )
        const methodID = dataRefsMap.get('his.odm.methods.MethodID')
        const sourceID = dataRefsMap.get('his.odm.sources.SourceID')

        const datapointsParams = Object.assign({
          datastream_id: data._id,
          time: {
            $gte: startTime,
            $lte: endTime
          },
          time_local: true,
          t_int: true,
          $limit: 2016,
          $sort: {
            time: 1
          }
        })

        let datapoints = await helpers.findMany('datapoints', datapointsParams)

        while (datapoints && datapoints.length) {
          let j = 0

          for (const datapoint of datapoints) {
            yield valueInfoType({
              datapoint,
              methodID,
              sourceID,
              qualityControlLevelCode
            })

            // Stay async friendly; scan 200 at a time (hardcoded)
            j++
            if (!(j % 200)) await new Promise(resolve => setImmediate(resolve))
          }

          // Fetch next page
          datapoints = await helpers.findMany(
            'datapoints',
            Object.assign(datapointsParams, {
              time: {
                $gt: datapoints[datapoints.length - 1].lt,
                $lte: endTime
              }
            })
          )
        }

        if (
          qualityControlLevelCode &&
          !qualityControlLevelCodes.has(qualityControlLevelCode)
        ) {
          qualityControlLevelCodes.set(qualityControlLevelCode, dataRefsMap)
        }

        if (methodID && !methodIDs.has(methodID)) {
          methodIDs.set(methodID, dataRefsMap)
        }

        if (sourceID && !sourceIDs.has(sourceID)) {
          sourceIDs.set(sourceID, dataRefsMap)
        }
      }

      for (const value of qualityControlLevelCodes.values()) {
        yield qualityControlLevelInfo({
          hasExplanation: true,
          refsMap: value
        })
      }

      for (const value of methodIDs.values()) {
        yield seriesMethod({
          hasMethodCode: true,
          refsMap: value
        })
      }

      for (const value of sourceIDs.values()) {
        yield seriesSource({
          hasSourceCode: true,
          refsMap: value
        })
      }

      yield censorCodeInfo({
        censorCode: 'nc',
        censorCodeDescription: 'not censored'
      })

      yield valuesEnd() + timeSeriesEnd()
    }
  }

  yield timeSeriesResponseEnd() +
    '</GetValuesForASiteObjectResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getValuesForASiteObject(request, ctx), {
        autoDestroy: true
      })
    )
}
