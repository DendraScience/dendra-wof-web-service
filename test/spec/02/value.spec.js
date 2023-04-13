/**
 * Serializers value tests
 */
import {
  timeSeriesResponseStart,
  timeSeriesResponseEnd,
  timeSeriesStart,
  timeSeriesEnd,
  sourceInfoStart,
  sourceInfoEnd,
  valuesStart,
  valuesEnd,
  getValuesResultStart,
  getValuesResultEnd,
  contactInfoType,
  valueInfoType,
  metadataInfoType
} from '../../../src/soap/serializers/value.js'

describe('Serializers', function () {
  describe('value', function () {
    it('should serialize timeSeriesResponseStart flavor 1', function () {
      expect(timeSeriesResponseStart({ hasAttribute: true })).to.equal(
        '<timeSeriesResponse xmlns:gml="http://www.opengis.net/gml"' +
          ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
          ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
          ' xmlns:wtr="http://www.cuahsi.org/waterML/"' +
          ' xmlns="http://www.cuahsi.org/waterML/1.1/">'
      )
    })

    it('should serialize timeSeriesResponseStart flavor 2', function () {
      expect(timeSeriesResponseStart({ hasAttribute: false })).to.equal(
        '<timeSeriesResponse>'
      )
    })

    it('should serialize timeSeriesResponseEnd', function () {
      expect(timeSeriesResponseEnd()).to.equal('</timeSeriesResponse>')
    })

    it('should serialize timeSeriesStart', function () {
      expect(timeSeriesStart()).to.equal('<timeSeries>')
    })

    it('should serialize timeSeriesEnd', function () {
      expect(timeSeriesEnd()).to.equal('</timeSeries>')
    })

    it('should serialize sourceInfoStart', function () {
      expect(sourceInfoStart()).to.equal('<sourceInfo xsi:type="SiteInfoType">')
    })

    it('should serialize sourceInfoEnd', function () {
      expect(sourceInfoEnd()).to.equal('</sourceInfo>')
    })

    it('should serialize valuesStart', function () {
      expect(valuesStart()).to.equal('<values>')
    })

    it('should serialize valuesEnd', function () {
      expect(valuesEnd()).to.equal('</values>')
    })

    it('should serialize getValuesResultStart', function () {
      expect(getValuesResultStart()).to.equal('<GetValuesResult>')
    })

    it('should serialize getValuesResultEnd', function () {
      expect(getValuesResultEnd()).to.equal('</GetValuesResult>')
    })

    it('should serialize contactInfoType flavor 1', function () {
      const data = {
        contactName: 'Martin Seul',
        typeOfContact: 'main',
        email: 'mseul@cuahsi.org',
        phone: '339-221-5400',
        address: '1167 Mass Ave'
      }
      expect(contactInfoType(data)).to.equal(
        '<contactInformation>' +
          '<contactName>Martin Seul</contactName>' +
          '<typeOfContact>main</typeOfContact>' +
          '<email>mseul@cuahsi.org</email>' +
          '<phone>339-221-5400</phone>' +
          '<address xsi:type="xsd:string">1167 Mass Ave</address>' +
          '</contactInformation>'
      )
    })
    it('should serialize contactInfoType flavor 2', function () {
      const data = {}
      expect(contactInfoType(data)).to.equal(
        '<contactInformation>' +
          '<typeOfContact>main</typeOfContact>' +
          '</contactInformation>'
      )
    })

    it('should serialize valueInfoType flavor 1', function () {
      expect(
        valueInfoType({
          datapoint: {
            lt: 1447586100000,
            t: 1447604100000,
            v: 8.5,
            d: { CensorCode: 'nc', UTCOffset: -5 }
          },
          methodID: '18',
          sourceID: '15',
          qualityControlLevelCode: '2'
        })
      ).to.equal(
        '<value censorCode="nc" dateTime="2015-11-15T11:15:00" timeOffset="-05:00" dateTimeUTC="2015-11-15T16:15:00" methodCode="18" sourceCode="15" qualityControlLevelCode="2">8.5</value>'
      )
    })

    it('should serialize valueInfoType value null flavor 2', function () {
      expect(
        valueInfoType({
          datapoint: {
            lt: 1447586100000,
            t: 1447604100000,
            v: null,
            d: { CensorCode: 'nc', UTCOffset: -5 }
          },
          methodID: '18',
          sourceID: '15',
          qualityControlLevelCode: '2'
        })
      ).to.equal(
        '<value censorCode="nc" dateTime="2015-11-15T11:15:00" timeOffset="-05:00" dateTimeUTC="2015-11-15T16:15:00" methodCode="18" sourceCode="15" qualityControlLevelCode="2">-9999</value>'
      )
    })

    it('should serialize metadataInfoType value', function () {
      const stationRefsMap = new Map([
        ['his.odm.isometadata.TopicCategory', 'inlandWaters'],
        ['his.odm.isometadata.Title', 'Wof-test River Program'],
        ['his.odm.isometadata.Abstract', 'The RiverWatch program'],
        ['his.odm.isometadata.ProfileVersion', 'Unknown'],
        ['his.odm.isometadata.MetadataLink', 'http://woftest.com/']
      ])
      expect(metadataInfoType(stationRefsMap)).to.equal(
        '<metadata>' +
          '<topicCategory>inlandWaters</topicCategory>' +
          '<title>Wof-test River Program</title>' +
          '<abstract>The RiverWatch program</abstract>' +
          '<profileVersion>Unknown</profileVersion>' +
          '<metadataLink>http://woftest.com/</metadataLink>' +
          '</metadata>'
      )
    })
  })
})
