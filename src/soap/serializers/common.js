import { encodeXML } from 'entities'

export function methodType(data) {
  if (typeof data !== 'object') return ''

  return (
    (data._id ? `<methodCode>${encodeXML(data._id)}</methodCode>` : '') +
    (data.name
      ? `<methodDescription>${encodeXML(data.name)}</methodDescription>`
      : '')
  )
}

export function responseStart(el) {
  return `<${el} xmlns="http://www.cuahsi.org/his/1.1/ws/">`
}

export function soapBodyStart() {
  return '<soap:Body>'
}

export function soapBodyEnd() {
  return '</soap:Body>'
}

export function soapEnvelopeStart() {
  return (
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"' +
    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
  )
}

export function soapEnvelopeEnd() {
  return '</soap:Envelope>'
}

export function soapFault(error) {
  if (typeof error !== 'object') return ''

  return (
    soapEnvelopeStart() +
    soapBodyStart() +
    '<soap:Fault>' +
    '<faultcode>soap:Server</faultcode>' +
    `<faultstring>${error.message}` +
    (error.request
      ? `\n${error.request.method.toUpperCase()} ${error.request.path}`
      : '') +
    '</faultstring>' +
    '<detail/>' +
    '</soap:Fault>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
  )
}

export function sourceType(data) {
  if (typeof data !== 'object') return ''

  return (
    (data.name ? `<organization>${encodeXML(data.name)}</organization>` : '') +
    (data.description
      ? `<sourceDescription>${encodeXML(data.description)}</sourceDescription>`
      : '')
  )
}

export function unitsType(data) {
  if (typeof data !== 'object') return ''

  return (
    (data.unitName ? `<unitName>${encodeXML(data.unitName)}</unitName>` : '') +
    (data.unitType ? `<unitType>${encodeXML(data.unitType)}</unitType>` : '') +
    (data.unitAbbreviation
      ? `<unitAbbreviation>${encodeXML(
          data.unitAbbreviation
        )}</unitAbbreviation>`
      : '') +
    (data.unitCode
      ? `<unitCode>${encodeXML(data.unitCode + '')}</unitCode>`
      : '')
  )
}

export function timePeriodType(data) {
  if (typeof data !== 'object') return ''

  return (
    (data.beginDateTime
      ? `<beginDateTime>${data.beginDateTime.substring(0, 19)}</beginDateTime>`
      : '') +
    (data.endDateTime
      ? `<endDateTime>${data.endDateTime.substring(0, 19)}</endDateTime>`
      : '') +
    (data.beginDateTimeUTC
      ? `<beginDateTimeUTC>${data.beginDateTimeUTC.substring(
          0,
          19
        )}</beginDateTimeUTC>`
      : '') +
    (data.endDateTimeUTC
      ? `<endDateTimeUTC>${data.endDateTimeUTC.substring(
          0,
          19
        )}</endDateTimeUTC>`
      : '')
  )
}
