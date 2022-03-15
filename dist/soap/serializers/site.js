"use strict";

const entities = require('entities');

function siteStart() {
  return '<site>';
}

function siteEnd() {
  return '</site>';
}

function sitesResponseStart() {
  return '<sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/">';
}

function sitesResponseEnd() {
  return '<sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/">';
}

function siteInfo({
  station
}) {
  return '<siteInfo>' + `<siteName>${entities.encodeXML(station.name)}</siteName>` + `<siteCode network="${entities.encodeXML(station.organization_lookup && station.organization_lookup.slug || 'dendra')}">${entities.encodeXML(station._id)}</siteCode>` + (station.geo && station.geo.type === 'Point' ? '<geoLocation>' + `<geogLocation xsi:type="LatLonPointType">` + `<latitude>${entities.encodeXML(station.geo.coordinates[1] + '')}</latitude>` + `<longitude>${entities.encodeXML(station.geo.coordinates[0] + '')}</longitude>` + '</geogLocation>' + '</geoLocation>' : '') + (station.geo && station.geo.type === 'Point' && station.geo.coordinates.length > 2 ? `<elevation_m>${entities.encodeXML(station.geo.coordinates[2] + '')}</elevation_m>` : '') + (station.description ? `<siteProperty name="Site Comments">${entities.encodeXML(station.description)}</siteProperty>` : '') + '</siteInfo>';
}

module.exports = {
  siteStart,
  siteEnd,
  sitesResponseStart,
  sitesResponseEnd,
  siteInfo
};