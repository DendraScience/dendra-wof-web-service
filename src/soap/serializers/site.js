import { encodeXML } from 'entities'

export function siteStart() {
  return '<site>'
}

export function siteEnd() {
  return '</site>'
}

export function siteInfoStart() {
  return '<siteInfo>'
}

export function siteInfoEnd() {
  return '</siteInfo>'
}

export function siteInfoType({ externalRefs, station }) {
  return (
    `<siteName>${encodeXML(station.name)}</siteName>` +
    (externalRefs && externalRefs.siteCode
      ? `<siteCode network="${encodeXML(
          (station.organization_lookup && station.organization_lookup.slug) ||
            'dendra'
        )}" siteID="${externalRefs.siteId}">${encodeXML(
          externalRefs.siteCode
        )}</siteCode>`
      : '') +
    (station.geo && station.geo.type === 'Point'
      ? '<geoLocation>' +
        `<geogLocation xsi:type="LatLonPointType">` +
        `<latitude>${encodeXML(station.geo.coordinates[1] + '')}</latitude>` +
        `<longitude>${encodeXML(station.geo.coordinates[0] + '')}</longitude>` +
        '</geogLocation>' +
        `${
          externalRefs && (externalRefs.localX || externalRefs.localY)
            ? `<localSiteXY projectionInformation="WGS 84 / UTM zone 19N">${
                externalRefs.localX
                  ? `<X>${encodeXML(externalRefs.localX)}</X>`
                  : ''
              }${
                externalRefs.localY
                  ? `<Y>${encodeXML(externalRefs.localY)}</Y>`
                  : ''
              }</localSiteXY>`
            : ''
        }` +
        '</geoLocation>'
      : '') +
    (externalRefs && externalRefs.elevation_m
      ? `<elevation_m>${encodeXML(externalRefs.elevation_m)}</elevation_m>`
      : '') +
    (externalRefs && externalRefs.verticalDatum
      ? `<verticalDatum>${encodeXML(
          externalRefs.verticalDatum
        )}</verticalDatum>`
      : '') +
    (externalRefs && externalRefs.county
      ? `<siteProperty name="County">${encodeXML(
          externalRefs.county
        )}</siteProperty>`
      : '') +
    (externalRefs && externalRefs.state
      ? `<siteProperty name="State">${encodeXML(
          externalRefs.state
        )}</siteProperty>`
      : '') +
    (externalRefs && externalRefs.comments
      ? `<siteProperty name="Site Comments">${encodeXML(
          externalRefs.comments
        )}</siteProperty>`
      : '') +
    (externalRefs && externalRefs.posAccuracy_m
      ? `<siteProperty name="PosAccuracy_m">${encodeXML(
          externalRefs.posAccuracy_m
        )}</siteProperty>`
      : '')
  )
}

// GetSitesObject have not 3 attributes
export function sitesResponseStart({ isObject = false }) {
  return (
    '<sitesResponse' +
    `${
      !isObject
        ? ' xmlns:gml="http://www.opengis.net/gml"' +
          ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
          ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
          ' xmlns:wtr="http://www.cuahsi.org/waterML/"'
        : ''
    }` +
    ' xmlns="http://www.cuahsi.org/waterML/1.1/">'
  )
}

export function sitesResponseEnd() {
  return '</sitesResponse>'
}

export function getSiteInfoResultStart() {
  return '<GetSiteInfoResult>'
}

export function getSiteInfoResultEnd() {
  return '</GetSiteInfoResult>'
}
