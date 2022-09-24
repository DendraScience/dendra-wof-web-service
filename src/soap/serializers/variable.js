import { encodeXML } from 'entities'
import { unitsType } from './common.js'

export function variableStart() {
  return '<variable>'
}

export function variableEnd() {
  return '</variable>'
}

export function variableInfoType({ datastream, unitCV, variableCV }) {
  const variableEl = (el, key) => {
    return datastream.terms &&
      datastream.terms.odm &&
      datastream.terms.odm[key] &&
      variableCV[key] &&
      variableCV[key][datastream.terms.odm[key]]
      ? `<${el}>${encodeXML(
          variableCV[key][datastream.terms.odm[key]]
        )}</${el}>`
      : ''
  }
  return (
    `<variableCode vocabulary="dendra" default="true">${encodeXML(
      datastream._id
    )}</variableCode>` +
    variableEl('variableName', 'VariableName') +
    `<variableDescription>${encodeXML(datastream.name)}</variableDescription>` +
    variableEl('valueType', 'ValueType') +
    variableEl('dataType', 'DataType') +
    variableEl('generalCategory', 'GeneralCategory') +
    variableEl('sampleMedium', 'SampleMedium') +
    (datastream.terms_info &&
    datastream.terms_info.unit_tag &&
    unitCV[datastream.terms_info.unit_tag]
      ? '<unit>' + unitsType(unitCV[datastream.terms_info.unit_tag]) + '</unit>'
      : '')
  )
}

export function variableDetails({ datastream, refsMap, unitCV }) {
  const variableElement = (el, key) => {
    return refsMap && refsMap.get(`his.odm.variables.${key}`)
      ? `<${el}>${encodeXML(refsMap.get(`his.odm.variables.${key}`))}</${el}>`
      : ''
  }
  return (
    `${
      refsMap && refsMap.get(`his.odm.variables.VariableCode`)
        ? `<variableCode vocabulary="dendra" default="true" ${
            refsMap.get(`his.odm.variables.VariableID`)
              ? `variableID="${refsMap.get(`his.odm.variables.VariableID`)}`
              : ''
          } ">${encodeXML(
            refsMap.get(`his.odm.variables.VariableCode`)
          )}</variableCode>`
        : ''
    } ` +
    variableElement('variableName', 'VariableName') +
    `<variableDescription>${encodeXML(datastream.name)}</variableDescription>` +
    variableElement('valueType', 'ValueType') +
    variableElement('dataType', 'DataType') +
    variableElement('generalCategory', 'GeneralCategory') +
    variableElement('sampleMedium', 'SampleMedium') +
    (datastream.terms_info &&
    datastream.terms_info.unit_tag &&
    unitCV[datastream.terms_info.unit_tag]
      ? '<unit>' + unitsType(unitCV[datastream.terms_info.unit_tag]) + '</unit>'
      : '') +
    (refsMap && refsMap.get(`his.odm.variables.NoDataValue`)
      ? `<noDataValue>${refsMap.get(
          `his.odm.variables.NoDataValue`
        )}</noDataValue>`
      : '') +
    '<timeScale isRegular="true">' +
    (refsMap &&
    (refsMap.get(`his.odm.units.TimeUnitsName`) ||
      refsMap.get(`his.odm.units.TimeUnitsType`) ||
      refsMap.get(`his.odm.units.TimeUnitsAbbreviation`) ||
      refsMap.get(`his.odm.units.TimeUnitsCode`))
      ? '<unit>' +
        unitsType({
          unitName: refsMap.get(`his.odm.units.TimeUnitsName`)
            ? refsMap.get(`his.odm.units.TimeUnitsName`)
            : undefined,
          unitType: refsMap.get(`his.odm.units.TimeUnitsType`)
            ? refsMap.get(`his.odm.units.TimeUnitsType`)
            : undefined,
          unitAbbreviation: refsMap.get(`his.odm.units.TimeUnitsAbbreviation`)
            ? refsMap.get(`his.odm.units.TimeUnitsAbbreviation`)
            : undefined,
          unitCode: refsMap.get(`his.odm.units.TimeUnitsCode`)
            ? refsMap.get(`his.odm.units.TimeUnitsCode`)
            : undefined
        }) +
        '</unit>'
      : '') +
    (refsMap && refsMap.get(`his.odm.variables.TimeSupport`)
      ? `<timeSupport>${
          refsMap && refsMap.get(`his.odm.variables.TimeSupport`)
        }</timeSupport>`
      : '') +
    '</timeScale>' +
    (refsMap && refsMap.get(`his.odm.variables.Speciation`)
      ? `<speciation>${refsMap.get(
          'his.odm.variables.Speciation'
        )}</speciation>`
      : '')
  )
}

export function variablesResultStart() {
  return '<GetVariablesResult>'
}

export function variablesResultEnd() {
  return '</GetVariablesResult>'
}

export function variablesResponseStart() {
  return (
    '<variablesResponse xmlns="http://www.cuahsi.org/waterML/1.1/"' +
    ' xmlns:gml="http://www.opengis.net/gml"' +
    ' xmlns:wtr="http://www.cuahsi.org/waterML/"' +
    ' xmlns:xlink="http://www.w3.org/1999/xlink">'
  )
}

export function variablesResponseEnd() {
  return '</variablesResponse>'
}

export function variablesStart() {
  return '<variables>'
}

export function variablesEnd() {
  return '</variables>'
}
