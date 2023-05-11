import { Readable } from 'stream'
import { encodeXML } from 'entities'
import { CacheControls, ContentTypes, Headers, uuid } from '../../lib/utils.js'
import {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
} from '../serializers/query.js'
import { siteInfoType } from '../serializers/site.js'
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
import {
  variableStart,
  variableInfoType,
  variableEnd
} from '../serializers/variable.js'
import {
  getValuesResultStart,
  timeSeriesResponseStart,
  timeSeriesStart,
  sourceInfoStart,
  valuesStart,
  valuesEnd,
  valueInfoType,
  sourceInfoEnd,
  censorCodeInfo,
  timeSeriesEnd,
  timeSeriesResponseEnd,
  getValuesResultEnd,
  offsetInfo,
  qualifierInfo,
  sampleInfo
} from '../serializers/value.js'
import {
  qualityControlLevelInfo,
  seriesMethod,
  seriesSource
} from '../serializers/series.js'
import { genDatastreams } from '../../lib/datastream.js'

export async function* getValues(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
) {
  const { location, variable, startDate, endDate } = parameters
  const siteParts = location && location.split(':')
  const variableParts = variable && variable.split(':')

  if (!siteParts[1]) {
    throw new Error(`Invalid location parameter '${location}'`)
  }

  if (!variableParts[1]) {
    throw new Error(`Invalid variable parameter '${variable}'`)
  }

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
          $and: [
            {
              external_refs: {
                $elemMatch: {
                  type: 'his.odm.variables.VariableCode',
                  identifier: { $regex: `^${variableParts[1]}$` }
                }
              }
            }
          ]
        }
      : undefined
  )
  const datastreams = await genDatastreams({
    helpers,
    params: datastreamsParams
  })
  let datastream = await datastreams.next()

  if (!datastream.value) throw new Error('Datastream not found')

  const unitCV = await helpers.getUnitCV()
  const datastreamTemplate = datastream.value
  const dataStreamRefsMap = datastreamTemplate.external_refs
    ? helpers.externalRefsMap(datastreamTemplate.external_refs)
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
    soapWsaAction('GetValuesResponse') +
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
    responseStart('GetValuesResponse') +
    getValuesResultStart() +
    encodeXML(
      timeSeriesResponseStart({ hasAttribute: true }) +
        queryInfoStart() +
        queryInfoType({
          date,
          method,
          parameters: [
            ['site', location || undefined],
            ['variable', variable || undefined],
            startDate ? ['startDate', startDate] : undefined,
            endDate ? ['endDate', endDate] : undefined
          ]
        }) +
        queryInfoEnd() +
        timeSeriesStart()
    )

  // Will only be one station since $limit=1
  for (const station of stations) {
    yield encodeXML(
      sourceInfoStart() +
        siteInfoType({
          hasAttribute: true,
          organizationRefsMap,
          refsMap: stationRefsMap,
          station
        }) +
        sourceInfoEnd()
    )
  }

  yield encodeXML(
    variableStart() +
      variableInfoType({
        datastream: datastreamTemplate,
        organizationRefsMap,
        refsMap: dataStreamRefsMap,
        unitCV
      }) +
      variableEnd()
  )

  yield encodeXML(valuesStart())

  const qualifierCodes = new Map()
  const qualityControlLevelCodes = new Map()
  const methodIDs = new Map()
  const sourceIDs = new Map()
  const offsetIDs = new Map()
  const censorCodes = new Map()
  const labSampleCodes = new Map()

  while (!datastream.done) {
    const datastreamValue = datastream.value
    const refsMap =
      datastreamValue && datastreamValue.external_refs
        ? helpers.externalRefsMap(datastreamValue.external_refs)
        : undefined
    const qualityControlLevelCode =
      refsMap &&
      refsMap.get('his.odm.qualitycontrollevels.QualityControlLevelCode')
    const methodID = refsMap.get('his.odm.methods.MethodID')
    const sourceID = refsMap.get('his.odm.sources.SourceID')
    const queryUTCOffset = refsMap && refsMap.get('his.wof.query.UTCOffset')

    const datapointsParams = Object.assign({
      datastream_id: datastreamValue._id,
      time: {
        $gte: parseInt(queryUTCOffset)
          ? startTime - parseInt(queryUTCOffset)
          : startTime,
        $lte: parseInt(queryUTCOffset)
          ? endTime - parseInt(queryUTCOffset)
          : endTime
      },
      time_local: !parseInt(queryUTCOffset),
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
        const annotationFlags =
          datapoint.q &&
          datapoint.q.flag &&
          datapoint.q.flag.length &&
          datapoint.q.flag.reduce((map, ref) => {
            const annotationFlag = ref.split(':')
            map.set(annotationFlag[0], annotationFlag[1])
            return map
          }, new Map())
        const annotationAttrib =
          datapoint.q &&
          datapoint.q.attrib &&
          Object.values(datapoint.q.attrib)[0]
        const qualifierCode =
          annotationFlags &&
          annotationFlags.get('his.odm.qualifiers.QualifierCode')
        const offsetTypeID =
          annotationFlags &&
          annotationFlags.get('his.odm.offsettypes.OffsetTypeID')
        const censorCode = datapoint.d && datapoint.d.CensorCode
        const labSampleCode =
          annotationFlags &&
          annotationFlags.get('his.odm.samples.LabSampleCode')
        const sampleID =
          annotationFlags && annotationFlags.get('his.odm.samples.SampleID')

        if (
          annotationFlags &&
          qualifierCode &&
          !qualifierCodes.has(qualifierCode)
        ) {
          qualifierCodes.set(qualifierCode, annotationFlags)
        }

        if (offsetTypeID && !offsetIDs.has(offsetTypeID)) {
          offsetIDs.set(offsetTypeID, { annotationAttrib, annotationFlags })
        }

        if (
          labSampleCode &&
          !labSampleCodes.has(labSampleCode + '-' + sampleID)
        ) {
          labSampleCodes.set(labSampleCode + '-' + sampleID, annotationFlags)
        }

        if (censorCode && !censorCodes.has(censorCode)) {
          censorCodes.set(censorCode, censorCode)
        }

        yield encodeXML(
          valueInfoType({
            annotationAttrib,
            annotationFlags,
            datapoint,
            methodID,
            sourceID,
            qualityControlLevelCode
          })
        )

        // Stay async friendly; scan 200 at a time (hardcoded)
        j++
        if (!(j % 200)) await new Promise(resolve => setImmediate(resolve))
      }

      // Fetch next page
      datapoints = await helpers.findMany(
        'datapoints',
        Object.assign(datapointsParams, {
          time: {
            $gt: parseInt(queryUTCOffset)
              ? datapoints[datapoints.length - 1].t
              : datapoints[datapoints.length - 1].lt,
            $lte: parseInt(queryUTCOffset)
              ? endTime - parseInt(queryUTCOffset)
              : endTime
          }
        })
      )

      if (
        qualityControlLevelCode &&
        !qualityControlLevelCodes.has(qualityControlLevelCode)
      ) {
        qualityControlLevelCodes.set(qualityControlLevelCode, refsMap)
      }

      if (methodID && !methodIDs.has(methodID)) {
        methodIDs.set(methodID, refsMap)
      }

      if (sourceID && !sourceIDs.has(sourceID)) {
        sourceIDs.set(sourceID, refsMap)
      }
    }

    datastream = await datastreams.next()
  }

  for (const value of qualifierCodes.values()) {
    yield encodeXML(qualifierInfo({ refsMap: value }))
  }

  for (const value of qualityControlLevelCodes.values()) {
    yield encodeXML(
      qualityControlLevelInfo({
        hasExplanation: true,
        refsMap: value
      })
    )
  }

  for (const value of methodIDs.values()) {
    yield encodeXML(
      seriesMethod({
        hasMethodCode: true,
        refsMap: value
      })
    )
  }

  for (const value of sourceIDs.values()) {
    yield encodeXML(
      seriesSource({
        hasSourceCode: true,
        refsMap: value,
        stationRefsMap
      })
    )
  }

  for (const value of offsetIDs.values()) {
    yield encodeXML(offsetInfo({ annotation: value, unitCV }))
  }

  for (const value of labSampleCodes.values()) {
    yield encodeXML(sampleInfo({ refsMap: value }))
  }

  for (const value of censorCodes.values()) {
    yield encodeXML(censorCodeInfo(helpers.findCensorCode(value)))
  }

  yield encodeXML(valuesEnd())

  yield encodeXML(timeSeriesEnd() + timeSeriesResponseEnd()) +
    getValuesResultEnd() +
    '</GetValuesResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getValues(request, ctx), {
        autoDestroy: true
      })
    )
}
