"use strict";

const entities = require('entities');

function unitsType(config) {
  return (config.unitName ? `<unitName>${entities.encodeXML(config.unitName)}</unitName>` : '') + (config.unitName ? `<unitType>${entities.encodeXML(config.unitType)}</unitType>` : '') + (config.unitAbbreviation ? `<unitAbbreviation>${entities.encodeXML(config.unitType)}</unitAbbreviation>` : '') + (config.unitCode ? `<unitCode>${entities.encodeXML(config.unitCode + '')}</unitCode>` : '');
}

function variableStart() {
  return '<variable>';
}

function variableEnd() {
  return '</variable>';
}

function variableInfoType({
  datastream,
  unitCV,
  variableCV
}) {
  const variableEl = (el, key) => {
    return datastream.terms && datastream.terms.odm && datastream.terms.odm[key] && variableCV[key] && variableCV[key][datastream.terms.odm[key]] ? `<${el}>${entities.encodeXML(variableCV[key][datastream.terms.odm[key]])}</${el}>` : '';
  };

  return `<variableCode vocabulary="dendra" default="true">${entities.encodeXML(datastream._id)}</variableCode>` + variableEl('variableName', 'VariableName') + `<variableDescription>${entities.encodeXML(datastream.name)}</variableDescription>` + variableEl('valueType', 'ValueType') + variableEl('dataType', 'DataType') + variableEl('generalCategory', 'GeneralCategory') + variableEl('sampleMedium', 'SampleMedium') + (datastream.terms_info && datastream.terms_info.unit_tag && unitCV[datastream.terms_info.unit_tag] ? '<unit>' + unitsType(unitCV[datastream.terms_info.unit_tag]) + '</unit>' : '');
}

module.exports = {
  unitsType,
  variableStart,
  variableEnd,
  variableInfoType
};