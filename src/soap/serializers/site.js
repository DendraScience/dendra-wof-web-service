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

export function siteInfoType({ station }) {
  return (
    `<siteName>${encodeXML(station.name)}</siteName>` +
    `<siteCode network="${encodeXML(
      (station.organization_lookup && station.organization_lookup.slug) ||
        'dendra'
    )}">${encodeXML(station._id)}</siteCode>` +
    (station.geo && station.geo.type === 'Point'
      ? '<geoLocation>' +
        `<geogLocation xsi:type="LatLonPointType">` +
        `<latitude>${encodeXML(station.geo.coordinates[1] + '')}</latitude>` +
        `<longitude>${encodeXML(station.geo.coordinates[0] + '')}</longitude>` +
        '</geogLocation>' +
        '</geoLocation>'
      : '') +
    (station.geo &&
    station.geo.type === 'Point' &&
    station.geo.coordinates.length > 2
      ? `<elevation_m>${encodeXML(
          station.geo.coordinates[2] + ''
        )}</elevation_m>`
      : '') +
    (station.description
      ? `<siteProperty name="Site Comments">${encodeXML(
          station.description
        )}</siteProperty>`
      : '')
  )
}

export function sitesResponseStart() {
  return '<sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/">'
}

export function sitesResponseEnd() {
  return '</sitesResponse>'
}
