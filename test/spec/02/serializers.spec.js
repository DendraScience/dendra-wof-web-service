/**
 * Serializers tests
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
import {
  siteStart,
  siteEnd,
  siteInfoStart,
  siteInfoEnd,
  sitesResponseStart,
  sitesResponseEnd,
  siteInfoType
} from '../../../src/soap/serializers/site.js'
import {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
} from '../../../src/soap/serializers/query.js'

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
          beginDateTime: new Date(1661964219333).toLocaleString(),
          endDateTime: new Date(1661964219333).toLocaleString(),
          beginDateTimeUTC: new Date(1661964219333).toLocaleString(),
          endDateTimeUTC: new Date(1661964219333).toLocaleString()
        })
      ).to.equal(
        '<beginDateTime>8/31/2022, 11:43:39</beginDateTime>' +
          '<endDateTime>8/31/2022, 11:43:39</endDateTime>' +
          '<beginDateTimeUTC>8/31/2022, 11:43:39</beginDateTimeUTC>' +
          '<endDateTimeUTC>8/31/2022, 11:43:39</endDateTimeUTC>'
      )
    })
  })

  describe('site', function () {
    it('should serialize siteStart', function () {
      expect(siteStart()).to.equal('<site>')
    })
    it('should serialize siteEnd', function () {
      expect(siteEnd()).to.equal('</site>')
    })

    it('should serialize siteInfoStart', function () {
      expect(siteInfoStart()).to.equal('<siteInfo>')
    })
    it('should serialize siteInfoEnd', function () {
      expect(siteInfoEnd()).to.equal('</siteInfo>')
    })
    it('should serialize siteInfoType flavor 1', function () {
      expect(
        siteInfoType({
          station: {
            _id: 'i98573457347593479537495388',
            name: 'My Station',
            organization_lookup: { slug: 'dendra' },
            geo: { type: 'Point', coordinates: ['32.9029', '-96.5639', '4'] },
            description: 'nice place'
          }
        })
      ).to.equal(
        '<siteName>My Station</siteName>' +
          '<siteCode network="dendra">i98573457347593479537495388</siteCode>' +
          '<geoLocation>' +
          '<geogLocation xsi:type="LatLonPointType">' +
          '<latitude>-96.5639</latitude>' +
          '<longitude>32.9029</longitude>' +
          '</geogLocation>' +
          '</geoLocation>' +
          '<elevation_m>4</elevation_m>' +
          '<siteProperty name="Site Comments">nice place</siteProperty>'
      )
    })
    it('should serialize siteInfoType flavor 2', function () {
      expect(
        siteInfoType({
          station: {
            _id: 'i98573457347593479537495388',
            name: 'My Station',
            organization_lookup: { slug: 'dendra' },
            description: 'nice place'
          }
        })
      ).to.equal(
        '<siteName>My Station</siteName>' +
          '<siteCode network="dendra">i98573457347593479537495388</siteCode>' +
          '<siteProperty name="Site Comments">nice place</siteProperty>'
      )
    })
    it('should serialize siteInfoType flavor 3', function () {
      expect(
        siteInfoType({
          station: {
            _id: 'i98573457347593479537495388',
            name: 'My Station',
            geo: { type: 'Point', coordinates: ['32.9029', '-96.5639', '4'] },
            description: 'nice place'
          }
        })
      ).to.equal(
        '<siteName>My Station</siteName>' +
          '<siteCode network="dendra">i98573457347593479537495388</siteCode>' +
          '<geoLocation>' +
          '<geogLocation xsi:type="LatLonPointType">' +
          '<latitude>-96.5639</latitude>' +
          '<longitude>32.9029</longitude>' +
          '</geogLocation>' +
          '</geoLocation>' +
          '<elevation_m>4</elevation_m>' +
          '<siteProperty name="Site Comments">nice place</siteProperty>'
      )
    })
    it('should serialize siteInfoType flavor 4', function () {
      expect(
        siteInfoType({
          station: {
            _id: 'i98573457347593479537495388',
            name: 'My Station',
            organization_lookup: { slug: 'dendra' },
            geo: { type: 'Cords', coordinates: ['32.9029', '-96.5639', '4'] },
            description: 'nice place'
          }
        })
      ).to.equal(
        '<siteName>My Station</siteName>' +
          '<siteCode network="dendra">i98573457347593479537495388</siteCode>' +
          '<siteProperty name="Site Comments">nice place</siteProperty>'
      )
    })
    it('should serialize siteInfoType flavor 5', function () {
      expect(
        siteInfoType({
          station: {
            _id: 'i98573457347593479537495388',
            name: 'My Station',
            organization_lookup: { slug: 'dendra' },
            geo: { type: 'Point', coordinates: ['32.9029', '-96.5639'] },
            description: 'nice place'
          }
        })
      ).to.equal(
        '<siteName>My Station</siteName>' +
          '<siteCode network="dendra">i98573457347593479537495388</siteCode>' +
          '<geoLocation>' +
          '<geogLocation xsi:type="LatLonPointType">' +
          '<latitude>-96.5639</latitude>' +
          '<longitude>32.9029</longitude>' +
          '</geogLocation>' +
          '</geoLocation>' +
          '<siteProperty name="Site Comments">nice place</siteProperty>'
      )
    })
    it('should serialize sitesResponseStart', function () {
      expect(sitesResponseStart()).to.equal(
        '<sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/">'
      )
    })
    it('should serialize sitesResponseEnd', function () {
      expect(sitesResponseEnd()).to.equal('</sitesResponse>')
    })
  })

  describe('query', function () {
    it('should serialize queryInfoStart', function () {
      expect(queryInfoStart()).to.equal('<queryInfo>')
    })
    it('should serialize queryInfoEnd', function () {
      expect(queryInfoEnd()).to.equal('</queryInfo>')
    })
    it('should serialize queryInfoType', function () {
      expect(
        queryInfoType({
          method: 'geySiteInfo()',
          parameters: ['authToken', 'refreshToken']
        })
      ).to.equal(
        `<creationTime>${new Date().toISOString()}</creationTime>` +
          '<criteria MethodCalled="geySiteInfo()">' +
          '<parameter name="a" value="u"/>' +
          '<parameter name="r" value="e"/>' +
          '</criteria>'
      )
    })
  })
})
