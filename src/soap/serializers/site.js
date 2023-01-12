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

export function siteInfoType({ organizationRefsMap, refsMap, station }) {
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
  const networkName =
    organizationRefsMap &&
    organizationRefsMap.get('his.odm.service.NetworkName')
  const srs = refsMap && refsMap.get('his.odm.sites.LatLongDatum.SRS')
  const projectionInformation =
    refsMap && refsMap.get('his.odm.sites.LocalProjection.CVSRSName')

  return (
    `<siteName>${station.name}</siteName>` +
    (siteCode
      ? `<siteCode network="${
          networkName || 'dendra'
        }" siteID="${siteId}">${encodeXML(siteCode)}</siteCode>`
      : '') +
    (station.geo && station.geo.type === 'Point'
      ? '<geoLocation>' +
        `<geogLocation xsi:type="LatLonPointType"${
          srs ? ` srs="${srs}"` : ``
        }>` +
        `<latitude>${encodeXML(station.geo.coordinates[1] + '')}</latitude>` +
        `<longitude>${encodeXML(station.geo.coordinates[0] + '')}</longitude>` +
        '</geogLocation>' +
        `${
          projectionInformation && (localX || localY)
            ? `<localSiteXY projectionInformation="${encodeXML(
                projectionInformation
              )}">${localX ? `<X>${encodeXML(localX)}</X>` : ''}${
                localY ? `<Y>${encodeXML(localY)}</Y>` : ''
              }</localSiteXY>`
            : ''
        }` +
        '</geoLocation>'
      : '') +
    (elevationM ? `<elevation_m>${elevationM}</elevation_m>` : '') +
    (verticalDatum ? `<verticalDatum>${verticalDatum}</verticalDatum>` : '') +
    (county ? `<siteProperty name="County">${county}</siteProperty>` : '') +
    (state ? `<siteProperty name="State">${state}</siteProperty>` : '') +
    (comments
      ? `<siteProperty name="Site Comments">${comments}</siteProperty>`
      : '') +
    (posAccuracyM
      ? `<siteProperty name="PosAccuracy_m">${posAccuracyM}</siteProperty>`
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
