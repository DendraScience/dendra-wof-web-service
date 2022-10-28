import { encodeXML } from 'entities'
import { methodType, sourceType, timePeriodType } from './common.js'
import { metadataInfoType, contactInfoType } from './value.js'

// TODO: change code to get data from 'thing-types'
export function seriesMethod({ hasMethodCode = false, refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const id = refsMap.get('his.odm.methods.MethodID')
  const description = refsMap.get('his.odm.methods.MethodDescription')

  return (
    `<method ${id ? `methodID="${encodeXML(id)}"` : ''}>` +
    `${id && hasMethodCode ? `<methodCode>${id}</methodCode>` : ''}` +
    methodType({ description }) +
    '</method>'
  )
}

export function seriesSource({ hasSourceCode = false, refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const sourceID = refsMap.get('his.odm.sources.SourceID')
  const name = refsMap.get('his.odm.sources.Organization')
  const description = refsMap.get('his.odm.sources.SourceDescription')
  const citation = refsMap.get('his.odm.sources.Citation')

  const contactName = refsMap.get('his.odm.sources.ContactName')
  const email = refsMap.get('his.odm.sources.Email')
  const phone = refsMap.get('his.odm.sources.Phone')
  const city = refsMap.get('his.odm.sources.City') || ''
  const state = refsMap.get('his.odm.sources.State') || ''
  const zipCode = refsMap.get('his.odm.sources.ZipCode') || ''
  const address =
    refsMap.get('his.odm.sources.Address') ||
    ''
      .concat(', ' + city)
      .concat(', ' + state)
      .concat(' ' + zipCode)
  const sourceLink = refsMap.get('his.odm.sources.SourceLink')

  return (
    `<source ${sourceID ? `sourceID="${sourceID}` : ''}">` +
    `${
      hasSourceCode && sourceID ? `<sourceCode>${sourceID}</sourceCode>` : ''
    }` +
    sourceType({ citation, description, name }) +
    `${hasSourceCode ? metadataInfoType('') : ''}` +
    `${
      hasSourceCode
        ? contactInfoType({ contactName, email, phone, address })
        : ''
    }` +
    `${
      hasSourceCode && sourceLink
        ? `<sourceLink>${sourceLink}</sourceLink>`
        : ''
    }` +
    `${citation ? `<citation>${encodeXML(citation)}</citation>` : ''}` +
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
    (lastDatapoint && lastDatapoint.lt) ||
    refsMap.get('his.odm.datavalues.EndDateTime')
  const beginDateTimeUTC =
    (firstDatapoint && firstDatapoint.t) ||
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

export function valueCount(vCount) {
  if (!(typeof vCount === 'number')) return ''
  return `<valueCount>${vCount}</valueCount>`
}

export function qualityControlLevelInfo({ hasExplanation = false, refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const qualityControlLevelID = refsMap.get(
    'his.odm.qualitycontrollevels.QualityControlLevelID'
  )
  const qualityControlLevelCode = refsMap.get(
    'his.odm.qualitycontrollevels.QualityControlLevelCode'
  )
  const definition = refsMap.get('his.odm.qualitycontrollevels.Definition')
  const explanation = refsMap.get('his.odm.qualitycontrollevels.Explanation')

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
  }${definition ? `<definition>${encodeXML(definition)}</definition>` : ''}${
    hasExplanation && explanation
      ? `<explanation>${encodeXML(explanation)}</explanation>`
      : ''
  }</qualityControlLevel>`
}
