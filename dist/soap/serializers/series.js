"use strict";

const {
  methodType,
  sourceType,
  timePeriodType
} = require('./common');

function seriesMethod({
  thingType
}) {
  return '<method>' + methodType(thingType) + '</method>';
}

function seriesSource({
  organization
}) {
  return '<source>' + sourceType(organization) + '</source>';
}

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

function variableTimeInterval({
  firstDatapoint,
  lastDatapoint
}) {
  return firstDatapoint && lastDatapoint ? '<variableTimeInterval>' + timePeriodType({
    beginDateTime: firstDatapoint.lt,
    endDateTime: lastDatapoint.lt,
    beginDateTimeUTC: firstDatapoint.t,
    endDateTimeUTC: lastDatapoint.t
  }) + '</variableTimeInterval>' : '';
}

function valueCount({
  datastream,
  firstDatapoint,
  lastDatapoint
}) {
  return datastream && datastream.general_config_resolved && datastream.general_config_resolved.sample_interval && firstDatapoint && lastDatapoint ? '<valueCount countIsEstimated="true">' + Math.floor((new Date(lastDatapoint.t) - new Date(firstDatapoint.t)) / datastream.general_config_resolved.sample_interval) + '</valueCount>' : '';
}

module.exports = {
  seriesMethod,
  seriesSource,
  seriesStart,
  seriesEnd,
  seriesCatalogStart,
  seriesCatalogEnd,
  variableTimeInterval,
  valueCount
};