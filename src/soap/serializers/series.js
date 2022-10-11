import { encodeXML } from 'entities'
import { methodType, sourceType, timePeriodType } from './common.js'

// TODO: change code to get data from 'thing-types'
export function seriesMethod({ refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const id = refsMap.get('his.odm.methods.MethodID')
  const description = refsMap.get('his.odm.methods.MethodDescription')

  return (
    `<method ${id ? `methodID="${encodeXML(id)}"` : ''}>` +
    methodType({ description }) +
    '</method>'
  )
}

export function seriesSource({ refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const sourceID = refsMap.get('his.odm.sources.SourceID')
  const name = refsMap.get('his.odm.sources.Organization')
  const description = refsMap.get('his.odm.sources.SourceDescription')
  const citation = refsMap.get('his.odm.sources.Citation')

  return (
    `<source ${sourceID ? `sourceID="${sourceID}` : ''}">` +
    sourceType({ citation, description, name }) +
    `</source>`
  )
}

export function seriesStart() {
  return '<series>'
}

export function seriesEnd() {
  return '</series>'
}

export function seriesCatalogStart(org) {
  return `<seriesCatalog menuGroupName="" serviceWsdl="https://hydroportal.cuahsi.org/${org}/cuahsi_1_1.asmx?WSDL">`
}

export function seriesCatalogEnd() {
  return '</seriesCatalog>'
}

export function variableTimeInterval({
  firstDatapoint,
  lastDatapoint,
  refsMap
}) {
  if (
    !(refsMap && typeof refsMap === 'object') &&
    !firstDatapoint &&
    !lastDatapoint
  )
    return ''

  const beginDateTime =
    (firstDatapoint && firstDatapoint.lt) ||
    refsMap.get('his.odm.datavalues.BeginDateTime')
  const endDateTime =
    (firstDatapoint && firstDatapoint.t) ||
    refsMap.get('his.odm.datavalues.EndDateTime')
  const beginDateTimeUTC =
    (lastDatapoint && lastDatapoint.lt) ||
    refsMap.get('his.odm.datavalues.BeginDateTimeUTC')
  const endDateTimeUTC =
    (lastDatapoint && lastDatapoint.t) ||
    refsMap.get('his.odm.datavalues.EndDateTimeUTC')

  return beginDateTime || endDateTime || beginDateTimeUTC || endDateTimeUTC
    ? '<variableTimeInterval xsi:type="TimeIntervalType">' +
        timePeriodType({
          beginDateTime,
          endDateTime,
          beginDateTimeUTC,
          endDateTimeUTC
        }) +
        '</variableTimeInterval>'
    : ''
}

// TODO: change to orginal code
export function valueCount({ refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const valueCount = refsMap.get('his.odm.datavalues.ValueCount')

  return `${
    valueCount ? `<valueCount>${encodeXML(valueCount)}</valueCount>` : ''
  }`
}

export function qualityControlLevelInfo({ refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const qualityControlLevelID = refsMap.get(
    'his.odm.qualitycontrollevels.QualityControlLevelID'
  )
  const qualityControlLevelCode = refsMap.get(
    'his.odm.qualitycontrollevels.QualityControlLevelCode'
  )
  const definition = refsMap.get('his.odm.qualitycontrollevels.Definition')

  return `<qualityControlLevel ${
    qualityControlLevelID
      ? `qualityControlLevelID="${encodeXML(qualityControlLevelID)}"`
      : ''
  }>${
    qualityControlLevelCode
      ? `<qualityControlLevelCode>${encodeXML(
          qualityControlLevelCode
        )}</qualityControlLevelCode>`
      : ''
  }${
    definition ? `<definition>${encodeXML(definition)}</definition>` : ''
  }</qualityControlLevel>`
}
