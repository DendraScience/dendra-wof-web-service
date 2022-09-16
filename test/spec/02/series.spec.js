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
  valueCount
} from '../../../src/soap/serializers/series.js'

describe('Serializers', function () {
  describe('series', function () {
    it('should serialize seriesMethod', function () {
      expect(
        seriesMethod({
          thingType: { _id: 'i98573457347593479537495388', name: 'GetSiteInfo' }
        })
      ).to.equal(
        '<method><methodCode>i98573457347593479537495388</methodCode><methodDescription>GetSiteInfo</methodDescription></method>'
      )
    })

    it('should serialize seriesSource', function () {
      expect(
        seriesSource({
          organization: {
            name: 'water',
            description:
              'a substance composed of the chemical elements hydrogen and oxygen and existing in gaseous, liquid, and solid states'
          }
        })
      ).to.equal(
        '<source><organization>water</organization><sourceDescription>a substance composed of the chemical elements hydrogen and oxygen and existing in gaseous, liquid, and solid states</sourceDescription></source>'
      )
    })

    it('should serialize seriesStart', function () {
      expect(seriesStart()).to.equal('<series>')
    })

    it('should serialize seriesEnd', function () {
      expect(seriesEnd()).to.equal('</series>')
    })

    it('should serialize seriesCatalogStart', function () {
      expect(seriesCatalogStart()).to.equal('<seriesCatalog>')
    })

    it('should serialize seriesCatalogEnd', function () {
      expect(seriesCatalogEnd()).to.equal('</seriesCatalog>')
    })

    it('should serialize variableTimeInterval', function () {
      const firstDatapoint = {
        lt: new Date(1661964219333).toISOString(),
        t: new Date(1663089496079).toISOString()
      }
      const lastDatapoint = {
        lt: new Date(1661964219333).toISOString(),
        t: new Date(1663089496079).toISOString()
      }
      expect(variableTimeInterval({ firstDatapoint, lastDatapoint })).to.equal(
        '<variableTimeInterval><beginDateTime>2022-08-31T16:43:39</beginDateTime><endDateTime>2022-08-31T16:43:39</endDateTime><beginDateTimeUTC>2022-09-13T17:18:16</beginDateTimeUTC><endDateTimeUTC>2022-09-13T17:18:16</endDateTimeUTC></variableTimeInterval>'
      )
    })

    it('should serialize valueCount', function () {
      const datastream = { general_config_resolved: { sample_interval: 10 } }
      const firstDatapoint = { t: new Date(1661964219333).toISOString() }
      const lastDatapoint = { t: new Date(1663089496079).toISOString() }
      expect(
        valueCount({ datastream, firstDatapoint, lastDatapoint })
      ).to.equal('<valueCount countIsEstimated="true">112527674</valueCount>')
    })
  })
})
