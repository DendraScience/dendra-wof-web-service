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
