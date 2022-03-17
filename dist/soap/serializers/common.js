"use strict";

const entities = require('entities');

function methodType(data) {
  return (data._id ? `<methodCode>${entities.encodeXML(data._id)}</methodCode>` : '') + (data.name ? `<methodDescription>${entities.encodeXML(data.name)}</methodDescription>` : '');
}

function responseStart(el) {
  return `<${el} xmlns="http://www.cuahsi.org/his/1.1/ws/">`;
}

function soapBodyStart() {
  return '<soap:Body>';
}

function soapBodyEnd() {
  return '</soap:Body>';
}

function soapEnvelopeStart() {
  return '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"' + ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + ' xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
}

function soapEnvelopeEnd() {
  return '</soap:Envelope>';
}

function soapFault(error) {
  return soapEnvelopeStart() + soapBodyStart() + '<soap:Fault>' + '<faultcode>soap:Server</faultcode>' + `<faultstring>${error.message}` + (error.request ? `\n${error.request.method.toUpperCase()} ${error.request.path}` : '') + '</faultstring>' + '<detail/>' + '</soap:Fault>' + soapBodyEnd() + soapEnvelopeEnd();
}

function sourceType(data) {
  return (data.name ? `<organization>${entities.encodeXML(data.name)}</organization>` : '') + (data.description ? `<sourceDescription>${entities.encodeXML(data.description)}</sourceDescription>` : '');
}

function unitsType(data) {
  return (data.unitName ? `<unitName>${entities.encodeXML(data.unitName)}</unitName>` : '') + (data.unitName ? `<unitType>${entities.encodeXML(data.unitType)}</unitType>` : '') + (data.unitAbbreviation ? `<unitAbbreviation>${entities.encodeXML(data.unitType)}</unitAbbreviation>` : '') + (data.unitCode ? `<unitCode>${entities.encodeXML(data.unitCode + '')}</unitCode>` : '');
}

function timePeriodType(data) {
  return (data.beginDateTime ? `<beginDateTime>${data.beginDateTime.substring(0, 19)}</beginDateTime>` : '') + (data.endDateTime ? `<endDateTime>${data.endDateTime.substring(0, 19)}</endDateTime>` : '') + (data.beginDateTimeUTC ? `<beginDateTimeUTC>${data.beginDateTimeUTC.substring(0, 19)}</beginDateTimeUTC>` : '') + (data.endDateTimeUTC ? `<endDateTimeUTC>${data.endDateTimeUTC.substring(0, 19)}</endDateTimeUTC>` : '');
}

module.exports = {
  methodType,
  responseStart,
  soapBodyStart,
  soapBodyEnd,
  soapEnvelopeStart,
  soapEnvelopeEnd,
  soapFault,
  sourceType,
  timePeriodType,
  unitsType
};