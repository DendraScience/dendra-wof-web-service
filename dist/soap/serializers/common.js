"use strict";

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
  return soapEnvelopeStart() + soapBodyStart() + '<soap:Fault>' + '<faultcode>soap:Server</faultcode>' + `<faultstring>${error.message}</faultstring>` + '<detail/>' + '</soap:Fault>' + soapBodyEnd() + soapEnvelopeEnd();
}

module.exports = {
  soapBodyStart,
  soapBodyEnd,
  soapEnvelopeStart,
  soapEnvelopeEnd,
  soapFault
};