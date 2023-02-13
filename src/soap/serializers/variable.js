import { encodeXML } from 'entities'
import { unitsType } from './common.js'

export function variableStart() {
  return '<variable>'
}

export function variableEnd() {
  return '</variable>'
}

export function variableInfoType({
  datastream,
  organizationRefsMap,
  refsMap,
  unitCV
}) {
  const variableEl = (el, key) => {
    const result = refsMap && refsMap.get(`his.odm.variables.${key}`)
    return result ? `<${el}>${encodeXML(result)}</${el}>` : ''
  }

  const variableCode = refsMap && refsMap.get(`his.odm.variables.VariableCode`)
  const variableID = refsMap && refsMap.get(`his.odm.variables.VariableID`)
  const variableNoDataValue =
    refsMap && refsMap.get(`his.odm.variables.NoDataValue`)
  const timeSupport = refsMap && refsMap.get(`his.odm.variables.TimeSupport`)
  const speciation = refsMap && refsMap.get(`his.odm.variables.Speciation`)
  const isRegular = refsMap && refsMap.get(`his.odm.variables.IsRegular`)
  const timeUnitTag = refsMap && refsMap.get('time_unit_tag')
  const vocabulary =
    organizationRefsMap && organizationRefsMap.get('his.odm.service.Vocabulary')

  return (
    `${
      variableCode
        ? `<variableCode ${
            vocabulary ? `vocabulary="${encodeXML(vocabulary)}"` : ''
          } default="true" ${
            variableID ? `variableID="${encodeXML(variableID)}` : ''
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
    (timeUnitTag && unitCV[`dt_Unit_${timeUnitTag}`]
      ? '<unit>' + unitsType(unitCV[`dt_Unit_${timeUnitTag}`]) + '</unit>'
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

/* 
  variables have 6 attributes
  variablesObject have not 3 attributes;
  GetVariableInfoObject have no attributes;
  GetvariableInfo have additional 2 attributes
*/
export function variablesResponseStart({
  hasAttribute = true,
  hasXMLSchema = false,
  isObject = false
}) {
  return (
    `<variablesResponse${
      hasAttribute ? ' xmlns="http://www.cuahsi.org/waterML/1.1/"' : ''
    }` +
    `${
      !isObject
        ? ' xmlns:gml="http://www.opengis.net/gml"' +
          ' xmlns:wtr="http://www.cuahsi.org/waterML/"' +
          ' xmlns:xlink="http://www.w3.org/1999/xlink"'
        : ''
    }` +
    `${
      hasXMLSchema
        ? ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        : ''
    }` +
    '>'
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

export function getVariableInfoResultStart() {
  return '<GetVariableInfoResult>'
}

export function getVariableInfoResultEnd() {
  return '</GetVariableInfoResult>'
}
