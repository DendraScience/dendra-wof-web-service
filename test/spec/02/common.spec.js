/**
 * Serializers common tests
 */
import {
  methodType,
  responseStart,
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
    it('should serialize methodType flavor 1', function () {
      expect(methodType({ _id: '1234', name: 'my method' })).to.equal(
        '<methodCode>1234</methodCode><methodDescription>my method</methodDescription>'
      )
    })

    it('should serialize methodType flavor 2', function () {
      expect(methodType({ _id: '1234' })).to.equal(
        '<methodCode>1234</methodCode>'
      )
    })

    it('should serialize responseStart', function () {
      expect(responseStart('elementName')).to.equal(
        '<elementName xmlns="http://www.cuahsi.org/his/1.1/ws/">'
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
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
          ' xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
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
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
          ' xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
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
          unitName: 'percent',
          unitType: 'Dimensionless',
          unitAbbreviation: '%',
          unitCode: '1'
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
