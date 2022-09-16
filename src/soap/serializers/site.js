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

export function siteInfoType({ externalRef, station }) {
  const siteCode =
    externalRef && externalRef.siteCode && externalRef.siteCode.split('-')[1]
  return (
    `<siteName>${encodeXML(station.name)}</siteName>` +
    (externalRef && externalRef.siteCode
      ? `<siteCode network="${encodeXML(
          (station.organization_lookup && station.organization_lookup.slug) ||
            'dendra'
        )}" siteID="${externalRef.siteId}">${encodeXML(
          externalRef.siteCode
        )}</siteCode>`
      : '') +
    (station.geo && station.geo.type === 'Point'
      ? '<geoLocation>' +
        `<geogLocation xsi:type="LatLonPointType" ${
          siteCode !== 'full' ? 'srs="EPSG:99999"' : ''
        }>` +
        `<latitude>${encodeXML(station.geo.coordinates[1] + '')}</latitude>` +
        `<longitude>${encodeXML(station.geo.coordinates[0] + '')}</longitude>` +
        '</geogLocation>' +
        `${
          siteCode === 'full'
            ? // (externalRef.localX || externalRef.localY)
              `<localSiteXY projectionInformation="WGS 84 / UTM zone 19N">${
                externalRef.localX
                  ? `<X>${encodeXML(externalRef.localX)}</X>`
                  : ''
              }${
                externalRef.localY
                  ? `<Y>${encodeXML(externalRef.localY)}</Y>`
                  : ''
              }</localSiteXY>`
            : ''
        }` +
        '</geoLocation>'
      : '') +
    (siteCode === 'full' &&
    station.geo &&
    station.geo.type === 'Point' &&
    station.geo.coordinates.length > 2
      ? `<elevation_m>${encodeXML(
          station.geo.coordinates[2] + ''
        )}</elevation_m>`
      : '') +
    (siteCode === 'full'
      ? `${
          externalRef.verticalDatum
            ? `<verticalDatum>${encodeXML(
                externalRef.verticalDatum
              )}</verticalDatum>`
            : ''
        }` +
        `${
          externalRef.county
            ? `<siteProperty name="County">${encodeXML(
                externalRef.county
              )}</siteProperty>`
            : ''
        }` +
        `${
          externalRef.state
            ? `<siteProperty name="State">${encodeXML(
                externalRef.state
              )}</siteProperty>`
            : ''
        }` +
        `${
          externalRef.comments
            ? `<siteProperty name="Site Comments">${encodeXML(
                externalRef.comments
              )}</siteProperty>`
            : ''
        }` +
        `${
          externalRef.posAccuracy_m
            ? `<siteProperty name="PosAccuracy_m">${encodeXML(
                externalRef.posAccuracy_m
              )}</siteProperty>`
            : ''
        }`
      : '')
  )
}

export function sitesResponseStart() {
  return '<sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/">'
}

export function sitesResponseEnd() {
  return '</sitesResponse>'
}
