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

export function siteInfoType({ refsMap, station }) {
  const siteId = refsMap && refsMap.get('his.odm.sites.SiteID')
  const siteCode = refsMap && refsMap.get('his.odm.sites.SiteCode')
  const verticalDatum = refsMap && refsMap.get('his.odm.sites.VerticalDatum')
  const localX = refsMap && refsMap.get('his.odm.sites.LocalX')
  const localY = refsMap && refsMap.get('his.odm.sites.LocalY')
  const posAccuracyM = refsMap && refsMap.get('his.odm.sites.PosAccuracy_m')
  const state = refsMap && refsMap.get('his.odm.sites.State')
  const county = refsMap && refsMap.get('his.odm.sites.County')
  const comments = refsMap && refsMap.get('his.odm.sites.Comments')
  const elevationM = refsMap && refsMap.get('his.odm.sites.Elevation_m')

  return (
    `<siteName>${encodeXML(station.name)}</siteName>` +
    (siteCode
      ? `<siteCode network="${encodeXML(
          (station.organization_lookup && station.organization_lookup.slug) ||
            'dendra'
        )}" siteID="${siteId}">${encodeXML(siteCode)}</siteCode>`
      : '') +
    (station.geo && station.geo.type === 'Point'
      ? '<geoLocation>' +
        `<geogLocation xsi:type="LatLonPointType">` +
        `<latitude>${encodeXML(station.geo.coordinates[1] + '')}</latitude>` +
        `<longitude>${encodeXML(station.geo.coordinates[0] + '')}</longitude>` +
        '</geogLocation>' +
        `${
          localX || localY
            ? `<localSiteXY projectionInformation="WGS 84 / UTM zone 19N">${
                localX ? `<X>${encodeXML(localX)}</X>` : ''
              }${localY ? `<Y>${encodeXML(localY)}</Y>` : ''}</localSiteXY>`
            : ''
        }` +
        '</geoLocation>'
      : '') +
    (elevationM ? `<elevation_m>${encodeXML(elevationM)}</elevation_m>` : '') +
    (verticalDatum
      ? `<verticalDatum>${encodeXML(verticalDatum)}</verticalDatum>`
      : '') +
    (county
      ? `<siteProperty name="County">${encodeXML(county)}</siteProperty>`
      : '') +
    (state
      ? `<siteProperty name="State">${encodeXML(state)}</siteProperty>`
      : '') +
    (comments
      ? `<siteProperty name="Site Comments">${encodeXML(
          comments
        )}</siteProperty>`
      : '') +
    (posAccuracyM
      ? `<siteProperty name="PosAccuracy_m">${encodeXML(
          posAccuracyM
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
