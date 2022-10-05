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

    it('should serialize siteInfoType with station and externalRefs flavor 1', function () {
      expect(
        siteInfoType({
          station: {
            _id: '631a4a3cf16fb05982b19980',
            name: 'SiteName-full',
            organization_lookup: { slug: 'dendra' },
            geo: { type: 'Point', coordinates: [-71.01234, 42.39215, 55] }
          },
          externalRefs: {
            siteCode: 'sitecode-full',
            siteId: '17',
            verticalDatum: 'NGVD29',
            localX: '334366.79',
            localY: '4695279.14',
            posAccuracy_m: '100',
            state: 'Massachusetts',
            county: 'Suffolk',
            comments: 'This is a full sites metadata record',
            elevation_m: '55'
          }
        })
      ).to.equal(
        '<siteName>SiteName-full</siteName>' +
          '<siteCode network="dendra" siteID="17">sitecode-full</siteCode>' +
          '<geoLocation>' +
          '<geogLocation xsi:type="LatLonPointType">' +
          '<latitude>42.39215</latitude>' +
          '<longitude>-71.01234</longitude>' +
          '</geogLocation>' +
          '<localSiteXY projectionInformation="WGS 84 / UTM zone 19N">' +
          '<X>334366.79</X>' +
          '<Y>4695279.14</Y>' +
          '</localSiteXY>' +
          '</geoLocation>' +
          '<elevation_m>55</elevation_m>' +
          '<verticalDatum>NGVD29</verticalDatum>' +
          '<siteProperty name="County">Suffolk</siteProperty>' +
          '<siteProperty name="State">Massachusetts</siteProperty>' +
          '<siteProperty name="Site Comments">This is a full sites metadata record</siteProperty>' +
          '<siteProperty name="PosAccuracy_m">100</siteProperty>'
      )
    })

    it('should serialize siteInfoType without externalRefs', function () {
      expect(
        siteInfoType({
          station: {
            _id: '631a4a3cf16fb05982b19980',
            name: 'SiteName-min',
            organization_lookup: { slug: 'dendra' },
            geo: { type: 'Point', coordinates: [-71.01234, 42.39215, 55] }
          }
        })
      ).to.equal(
        '<siteName>SiteName-min</siteName>' +
          '<geoLocation>' +
          '<geogLocation xsi:type="LatLonPointType">' +
          '<latitude>42.39215</latitude>' +
          '<longitude>-71.01234</longitude>' +
          '</geogLocation>' +
          '</geoLocation>'
      )
    })

    it('should serialize siteInfoType with station and externalRefs flavor 2', function () {
      expect(
        siteInfoType({
          station: {
            _id: '631a4a3cf16fb05982b19980',
            name: 'SiteName-min',
            organization_lookup: { slug: 'dendra' },
            geo: { type: 'Point', coordinates: [-71.01234, 42.39215, 55] }
          },
          externalRefs: {
            siteCode: 'sitecode-min',
            siteId: '18'
          }
        })
      ).to.equal(
        '<siteName>SiteName-min</siteName>' +
          '<siteCode network="dendra" siteID="18">sitecode-min</siteCode>' +
          '<geoLocation>' +
          '<geogLocation xsi:type="LatLonPointType">' +
          '<latitude>42.39215</latitude>' +
          '<longitude>-71.01234</longitude>' +
          '</geogLocation>' +
          '</geoLocation>'
      )
    })

    it('should serialize sitesResponseStart flavor 1', function () {
      expect(sitesResponseStart({ isObject: true })).to.equal(
        '<sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/">'
      )
    })

    it('should serialize sitesResponseStart flavor 2', function () {
      expect(sitesResponseStart({ isObject: false })).to.equal(
        '<sitesResponse' +
          ' xmlns:gml="http://www.opengis.net/gml"' +
          ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
          ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
          ' xmlns:wtr="http://www.cuahsi.org/waterML/"' +
          ' xmlns="http://www.cuahsi.org/waterML/1.1/">'
      )
    })

    it('should serialize sitesResponseEnd', function () {
      expect(sitesResponseEnd()).to.equal('</sitesResponse>')
    })
  })
})
