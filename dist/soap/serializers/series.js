"use strict";

function seriesStart() {
  return '<series>';
}

function seriesEnd() {
  return '</series>';
}

function seriesCatalogStart() {
  return '<seriesCatalog>';
}

function seriesCatalogEnd() {
  return '</seriesCatalog>';
}

module.exports = {
  seriesStart,
  seriesEnd,
  seriesCatalogStart,
  seriesCatalogEnd
};