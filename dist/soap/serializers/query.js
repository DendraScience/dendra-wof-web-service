"use strict";

const entities = require('entities');

function queryInfoStart() {
  return '<queryInfo>';
}

function queryInfoEnd() {
  return '</queryInfo>';
}

function queryInfoType({
  method,
  parameters
}) {
  return `<creationTime>${new Date().toISOString()}</creationTime>` + `<criteria MethodCalled="${method}">` + Object.entries(parameters).map(entry => `<parameter name="${entry[0]}" value="${entities.encodeXML(entry[1])}"/>`).join('') + '</criteria>';
}

module.exports = {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
};