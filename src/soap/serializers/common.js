import { encodeXML } from 'entities'

export function methodType(data) {
  if (!(data && typeof data === 'object')) return ''

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

export function soapHeaderStart() {
  return '<soap:Header>'
}

export function soapHeaderEnd() {
  return '</soap:Header>'
}

export function soapWsaAction(method) {
  return `<wsa:Action>http://www.cuahsi.org/his/1.1/ws/${method}</wsa:Action>`
}

export function soapWsaMessageID(uuid) {
  return `<wsa:MessageID>urn:uuid:${uuid}</wsa:MessageID>`
}

export function soapWsaRelatesTo(uuid) {
  return `<wsa:RelatesTo>urn:uuid:${uuid}</wsa:RelatesTo>`
}
// export function soapWsa({ el, uuid }) {
//   return `<wsa:${el}>urn:uuid:${uuid}</wsa:${el}>`
// }

export function soapWsaTo() {
  return '<wsa:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:To>'
}

export function soapWsseSecurityStart() {
  return '<wsse:Security>'
}

export function soapWsseSecurityEnd() {
  return '</wsse:Security>'
}

export function soapWsuTimestampStart(uuid) {
  return `<wsu:Timestamp wsu:Id="Timestamp-${uuid}">`
}

export function soapWsuTimestampEnd() {
  return `</wsu:Timestamp>`
}

export function soapWsuInfo({ date = new Date() }) {
  return (
    `<wsu:Created>${date.toISOString()}</wsu:Created>` +
    `<wsu:Expires>${new Date(
      date.getTime() + 5 * 60000
    ).toISOString()}</wsu:Expires>`
  )
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
    ' xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"' +
    ' xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
    ' xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"' +
    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
  )
}

export function soapEnvelopeEnd() {
  return '</soap:Envelope>'
}

export function soapFault(error) {
  if (!(error && typeof error === 'object')) return ''

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
  if (!(data && typeof data === 'object')) return ''

  return (
    (data.name ? `<organization>${encodeXML(data.name)}</organization>` : '') +
    (data.description
      ? `<sourceDescription>${encodeXML(data.description)}</sourceDescription>`
      : '')
  )
}

export function unitsType(data) {
  if (!(data && typeof data === 'object')) return ''

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
  if (!(data && typeof data === 'object')) return ''

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
