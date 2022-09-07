/**
 * Serializers site tests
 */

import {
  siteStart,
  siteEnd,
  siteInfoStart,
  siteInfoEnd,
  sitesResponseStart,
  sitesResponseEnd,
  siteInfoType
} from '../../../src/soap/serializers/site.js'
describe('Serializers', function () {
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
})
