import { methodType, sourceType, timePeriodType } from './common.js'

export function seriesMethod({ thingType }) {
  return '<method>' + methodType(thingType) + '</method>'
}

export function seriesSource({ organization }) {
  return '<source>' + sourceType(organization) + '</source>'
}

export function seriesStart() {
  return '<series>'
}

export function seriesEnd() {
  return '</series>'
}

export function seriesCatalogStart() {
  return '<seriesCatalog>'
}

export function seriesCatalogEnd() {
  return '</seriesCatalog>'
}

export function variableTimeInterval({ firstDatapoint, lastDatapoint }) {
  return firstDatapoint && lastDatapoint
    ? '<variableTimeInterval>' +
        timePeriodType({
          beginDateTime: firstDatapoint.lt,
          endDateTime: lastDatapoint.lt,
          beginDateTimeUTC: firstDatapoint.t,
          endDateTimeUTC: lastDatapoint.t
        }) +
        '</variableTimeInterval>'
    : ''
}

export function valueCount({ datastream, firstDatapoint, lastDatapoint }) {
  return datastream &&
    datastream.general_config_resolved &&
    datastream.general_config_resolved.sample_interval &&
    firstDatapoint &&
    lastDatapoint
    ? '<valueCount countIsEstimated="true">' +
        Math.floor(
          (new Date(lastDatapoint.t) - new Date(firstDatapoint.t)) /
            datastream.general_config_resolved.sample_interval
        ) +
        '</valueCount>'
    : ''
}
