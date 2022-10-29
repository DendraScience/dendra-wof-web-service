/**
 * Serializers series tests
 */
import {
  seriesMethod,
  seriesSource,
  seriesStart,
  seriesEnd,
  seriesCatalogStart,
  seriesCatalogEnd,
  variableTimeInterval,
  valueCount,
  qualityControlLevelInfo
} from '../../../src/soap/serializers/series.js'

describe('Serializers', function () {
  describe('series', function () {
    it('should serialize seriesMethod', function () {
      const refsMap = new Map([
        ['his.odm.methods.MethodID', '17'],
        ['his.odm.methods.MethodDescription', 'Full Method description']
      ])

      expect(seriesMethod({ refsMap })).to.equal(
        '<method methodID="17"><methodDescription>Full Method description</methodDescription></method>'
      )
    })

    it('should serialize seriesSource', function () {
      const refsMap = new Map([
        ['his.odm.sources.SourceID', '18'],
        ['his.odm.sources.Organization', 'CUAHSI'],
        [
          'his.odm.sources.SourceDescription',
          'Consortium of Universities for the Advancement of Hydrologic Science, Inc'
        ],
        ['his.odm.sources.Citation', 'CUAHSI-Citation']
      ])

      expect(seriesSource({ refsMap })).to.equal(
        '<source sourceID="18"><organization>CUAHSI</organization><sourceDescription>Consortium of Universities for the Advancement of Hydrologic Science, Inc</sourceDescription><citation>CUAHSI-Citation</citation></source>'
      )
    })

    it('should serialize seriesStart', function () {
      expect(seriesStart()).to.equal('<series>')
    })

    it('should serialize seriesEnd', function () {
      expect(seriesEnd()).to.equal('</series>')
    })

    it('should serialize seriesCatalogStart', function () {
      expect(seriesCatalogStart('woftest')).to.equal(
        '<seriesCatalog menuGroupName="" serviceWsdl="https://hydroportal.cuahsi.org/woftest/cuahsi_1_1.asmx?WSDL">'
      )
    })

    it('should serialize seriesCatalogEnd', function () {
      expect(seriesCatalogEnd()).to.equal('</seriesCatalog>')
    })

    it('should serialize variableTimeInterval', function () {
      const refsMap = new Map([
        [
          'his.odm.datavalues.BeginDateTime',
          new Date(1661964219333).toISOString()
        ],
        [
          'his.odm.datavalues.EndDateTime',
          new Date(1663089496079).toISOString()
        ],
        [
          'his.odm.datavalues.BeginDateTimeUTC',
          new Date(1661964219333).toISOString()
        ],
        [
          'his.odm.datavalues.EndDateTimeUTC',
          new Date(1663089496079).toISOString()
        ]
      ])

      expect(variableTimeInterval({ refsMap })).to.equal(
        '<variableTimeInterval xsi:type="TimeIntervalType"><beginDateTime>2022-08-31T16:43:39</beginDateTime><endDateTime>2022-09-13T17:18:16</endDateTime><beginDateTimeUTC>2022-08-31T16:43:39</beginDateTimeUTC><endDateTimeUTC>2022-09-13T17:18:16</endDateTimeUTC></variableTimeInterval>'
      )
    })

    it('should serialize valueCount', function () {
      expect(valueCount(37)).to.equal('<valueCount>37</valueCount>')
    })

    it('should serialize qualityControlLevelInfo', function () {
      const refsMap = new Map([
        ['his.odm.qualitycontrollevels.QualityControlLevelID', '2'],
        ['his.odm.qualitycontrollevels.QualityControlLevelCode', '3'],
        [
          'his.odm.qualitycontrollevels.Definition',
          'Quality Assurance Project Plan (QAPP)'
        ]
      ])

      expect(qualityControlLevelInfo({ refsMap })).to.equal(
        '<qualityControlLevel qualityControlLevelID="2">' +
          '<qualityControlLevelCode>3</qualityControlLevelCode>' +
          '<definition>Quality Assurance Project Plan (QAPP)</definition>' +
          '</qualityControlLevel>'
      )
    })
  })
})
