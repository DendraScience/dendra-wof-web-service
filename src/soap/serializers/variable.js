import { encodeXML } from 'entities'
import { unitsType } from './common.js'

export function variableStart() {
  return '<variable>'
}

export function variableEnd() {
  return '</variable>'
}

export function variableInfoType({ datastream, refsMap, unitCV }) {
  const toNameCase = str => {
    return str.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }

  const variableEl = (el, key) => {
    const result = refsMap && refsMap.get(`his.odm.variables.${key}`)
    return result ? `<${el}>${encodeXML(result)}</${el}>` : ''
  }

  const variableCode = refsMap && refsMap.get(`his.odm.variables.VariableCode`)
  const variableID = refsMap && refsMap.get(`his.odm.variables.VariableID`)
  const variableNoDataValue =
    refsMap && refsMap.get(`his.odm.variables.NoDataValue`)
  const timeUnitsName = refsMap && refsMap.get(`his.odm.units.TimeUnitsName`)
  const timeSupport = refsMap && refsMap.get(`his.odm.variables.TimeSupport`)
  const speciation = refsMap && refsMap.get(`his.odm.variables.Speciation`)
  const isRegular = refsMap && refsMap.get(`his.odm.variables.IsRegular`)

  return (
    `${
      variableCode
        ? `<variableCode vocabulary="${encodeXML(
            (datastream.organization_lookup &&
              datastream.organization_lookup.slug) ||
              'dendra'
          )}" default="true" ${
            variableID ? `variableID="${variableID}` : ''
          }">${encodeXML(variableCode)}</variableCode>`
        : ''
    } ` +
    variableEl('variableName', 'VariableName') +
    variableEl('valueType', 'ValueType') +
    variableEl('dataType', 'DataType') +
    variableEl('generalCategory', 'GeneralCategory') +
    variableEl('sampleMedium', 'SampleMedium') +
    (datastream.terms_info &&
    datastream.terms_info.unit_tag &&
    unitCV[datastream.terms_info.unit_tag]
      ? '<unit>' + unitsType(unitCV[datastream.terms_info.unit_tag]) + '</unit>'
      : '') +
    (variableNoDataValue
      ? `<noDataValue>${encodeXML(variableNoDataValue)}</noDataValue>`
      : '') +
    `<timeScale ${isRegular ? 'isRegular="true"' : ''}>` +
    (timeUnitsName &&
    unitCV[`dt_Unit_${toNameCase(timeUnitsName).replace(/\s/g, '')}`]
      ? '<unit>' +
        unitsType(
          unitCV[`dt_Unit_${toNameCase(timeUnitsName).replace(/\s/g, '')}`]
        ) +
        '</unit>'
      : '') +
    (timeSupport
      ? `<timeSupport>${encodeXML(timeSupport)}</timeSupport>`
      : '') +
    '</timeScale>' +
    (speciation ? `<speciation>${encodeXML(speciation)}</speciation>` : '')
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
