/**
 * Serializers common tests
 */
import { uuid } from '../../../src/lib/utils.js'
import {
  methodType,
  responseStart,
  soapHeaderStart,
  soapHeaderEnd,
  soapWsaAction,
  soapWsaMessageID,
  soapWsaRelatesTo,
  soapWsaTo,
  soapWsseSecurityStart,
  soapWsseSecurityEnd,
  soapWsuTimestampStart,
  soapWsuTimestampEnd,
  soapWsuInfo,
  soapBodyStart,
  soapBodyEnd,
  soapEnvelopeStart,
  soapEnvelopeEnd,
  soapFault,
  sourceType,
  unitsType,
  timePeriodType
} from '../../../src/soap/serializers/common.js'

describe('Serializers', function () {
  describe('common', function () {
    it('should serialize methodType', function () {
      expect(methodType({ description: 'Full Method description' })).to.equal(
        '<methodDescription>Full Method description</methodDescription>'
      )
    })

    it('should serialize responseStart', function () {
      expect(responseStart('elementName')).to.equal(
        '<elementName xmlns="http://www.cuahsi.org/his/1.1/ws/">'
      )
    })

    it('should serialize soapHeaderStart', function () {
      expect(soapHeaderStart()).to.equal('<soap:Header>')
    })

    it('should serialize soapHeaderEnd', function () {
      expect(soapHeaderEnd()).to.equal('</soap:Header>')
    })

    it('should serialize soapWsaAction', function () {
      expect(soapWsaAction('GetSitesObjectResponse')).to.equal(
        '<wsa:Action>http://www.cuahsi.org/his/1.1/ws/GetSitesObjectResponse</wsa:Action>'
      )
    })
    it('should serialize soapWsaMessageID', function () {
      const uniqueid = uuid()
      expect(soapWsaMessageID(uniqueid)).to.equal(
        `<wsa:MessageID>urn:uuid:${uniqueid}</wsa:MessageID>`
      )
    })
    it('should serialize soapWsaRelatesTo', function () {
      const uniqueid = uuid()
      expect(soapWsaRelatesTo(uniqueid)).to.equal(
        `<wsa:RelatesTo>urn:uuid:${uniqueid}</wsa:RelatesTo>`
      )
    })
    it('should serialize soapWsaTo', function () {
      expect(soapWsaTo()).to.equal(
        '<wsa:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:To>'
      )
    })

    it('should serialize soapWsseSecurityStart', function () {
      expect(soapWsseSecurityStart('MessageID')).to.equal('<wsse:Security>')
    })

    it('should serialize soapWsseSecurityEnd', function () {
      expect(soapWsseSecurityEnd()).to.equal('</wsse:Security>')
    })

    it('should serialize soapWsuTimestampStart', function () {
      const timestamp = uuid()
      expect(soapWsuTimestampStart(timestamp)).to.equal(
        `<wsu:Timestamp wsu:Id="Timestamp-${timestamp}">`
      )
    })

    it('should serialize soapWsuTimestampEnd', function () {
      expect(soapWsuTimestampEnd()).to.equal('</wsu:Timestamp>')
    })

    it('should serialize soapWsuInfo', function () {
      const date = new Date(1661964219333)
      expect(soapWsuInfo({ date })).to.equal(
        '<wsu:Created>2022-08-31T16:43:39.333Z</wsu:Created>' +
          '<wsu:Expires>2022-08-31T16:48:39.333Z</wsu:Expires>'
      )
    })

    it('should serialize soapBodyStart', function () {
      expect(soapBodyStart()).to.equal('<soap:Body>')
    })

    it('should serialize soapBodyEnd', function () {
      expect(soapBodyEnd()).to.equal('</soap:Body>')
    })

    it('should serialize soapEnvelopeStart', function () {
      expect(soapEnvelopeStart()).to.equal(
        '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"' +
          ' xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"' +
          ' xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
          ' xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"' +
          ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
      )
    })

    it('should serialize soapEnvelopeEnd', function () {
      expect(soapEnvelopeEnd()).to.equal('</soap:Envelope>')
    })

    it('should serialize soapFault', function () {
      expect(
        soapFault({
          message: 'some error',
          request: { method: 'GETDATA', path: 'C://programFile' }
        })
      ).to.equal(
        '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"' +
          ' xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"' +
          ' xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
          ' xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"' +
          ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
          '<soap:Body>' +
          '<soap:Fault>' +
          '<faultcode>soap:Server</faultcode>' +
          `<faultstring>some error` +
          `\nGETDATA C://programFile` +
          '</faultstring>' +
          '<detail/>' +
          '</soap:Fault>' +
          '</soap:Body>' +
          '</soap:Envelope>'
      )
    })

    it('should serialize sourceType', function () {
      expect(
        sourceType({
          name: 'water',
          description:
            'a substance composed of the chemical elements hydrogen and oxygen and existing in gaseous, liquid, and solid states'
        })
      ).to.equal(
        '<organization>water</organization>' +
          '<sourceDescription>a substance composed of the chemical elements hydrogen and oxygen and existing in gaseous, liquid, and solid states</sourceDescription>'
      )
    })

    it('should serialize unitsType', function () {
      expect(
        unitsType({
          UnitsName: 'percent',
          UnitsType: 'Dimensionless',
          UnitsAbbreviation: '%',
          UnitsID: '1'
        })
      ).to.equal(
        '<unitName>percent</unitName>' +
          '<unitType>Dimensionless</unitType>' +
          '<unitAbbreviation>%</unitAbbreviation>' +
          '<unitCode>1</unitCode>'
      )
    })

    it('should serialize timePeriodType', function () {
      expect(
        timePeriodType({
          beginDateTime: new Date(1661964219333).toISOString(),
          endDateTime: new Date(1661964219333).toISOString(),
          beginDateTimeUTC: new Date(1661964219333).toISOString(),
          endDateTimeUTC: new Date(1661964219333).toISOString()
        })
      ).to.equal(
        '<beginDateTime>2022-08-31T16:43:39</beginDateTime>' +
          '<endDateTime>2022-08-31T16:43:39</endDateTime>' +
          '<beginDateTimeUTC>2022-08-31T16:43:39</beginDateTimeUTC>' +
          '<endDateTimeUTC>2022-08-31T16:43:39</endDateTimeUTC>'
      )
    })
  })
})
