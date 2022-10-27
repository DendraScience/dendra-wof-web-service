import { encodeXML } from 'entities'

export function timeSeriesResponseStart({ hasAttribute = false }) {
  return `<timeSeriesResponse${
    hasAttribute
      ? ` xmlns="http://www.cuahsi.org/waterML/1.1/"` +
        ` xmlns:gml="http://www.opengis.net/gml"` +
        ` xmlns:wtr="http://www.cuahsi.org/waterML/"` +
        ` xmlns:xlink="http://www.w3.org/1999/xlink"`
      : ``
  }>`
}

export function timeSeriesResponseEnd() {
  return '</timeSeriesResponse>'
}

export function timeSeriesStart() {
  return '<timeSeries>'
}

export function timeSeriesEnd() {
  return '</timeSeries>'
}

export function sourceInfoStart() {
  return '<sourceInfo xsi:type="SiteInfoType">'
}

export function sourceInfoEnd() {
  return '</sourceInfo>'
}

export function valuesStart() {
  return '<values>'
}

export function valuesEnd() {
  return '</values>'
}

export function valueInfoType({
  datapoint,
  methodId,
  sourceID,
  qualityControlLevelCode
}) {
  if (!(datapoint && typeof datapoint === 'object')) return ''

  const censorCode = 'nc'
  const dateTime = new Date(datapoint.lt).toISOString().replace('.000Z', '')
  const timeOffset = '-05:00'
  const dateTimeUTC = new Date(datapoint.t).toISOString().replace('.000Z', '')
  const value = datapoint.v

  return `<value ${censorCode ? `censorCode="${encodeXML(censorCode)}"` : ''} ${
    dateTime ? `dateTime="${dateTime}"` : ''
  } ${timeOffset ? `timeOffset="${encodeXML(timeOffset)}"` : ''} ${
    dateTimeUTC ? `dateTimeUTC="${dateTimeUTC}"` : ''
  } ${methodId ? `methodCode="${encodeXML(methodId)}"` : ''} ${
    sourceID ? `sourceCode="${encodeXML(sourceID)}"` : ''
  } ${
    qualityControlLevelCode
      ? `qualityControlLevelCode="${encodeXML(qualityControlLevelCode)}"`
      : ''
  }>${value}</value>`
}

export function metadataInfoType(data) {
  if (!(data && typeof data === 'object')) return ''

  const topicCategory = data.topicCategory
  const title = data.title
  const abstract = data.abstract
  const profileVersion = data.profileVersion
  const metadataLink = data.metadataLink
  return (
    '<metadata>' +
    `${topicCategory ? `<topicCategory>{topicCategory}</topicCategory>` : ''}` +
    `${title ? `<title>${title}</title>` : ''}` +
    `${abstract ? `<abstract>${abstract}</abstract>` : ''}` +
    `${
      profileVersion ? `<profileVersion>${profileVersion}</profileVersion>` : ''
    }` +
    `${metadataLink ? `<metadataLink>${metadataLink}</metadataLink>` : ''}` +
    '</metadata>'
  )
}

export function contactInfoType(data) {
  if (!(data && typeof data === 'object')) return ''

  const contactName = data.contactName
  // TODO: type of contact
  const typeOfContact = 'main'
  const email = data.email
  const phone = data.phone
  const address = data.address

  return (
    '<contactInformation>' +
    `${contactName ? `<contactName>${contactName}</contactName>` : ''}` +
    `${
      typeOfContact ? `<typeOfContact>${typeOfContact}</typeOfContact>` : ''
    }` +
    `${email ? `<email>${email}</email>` : ''}` +
    `${phone ? `<phone>${phone}</phone>` : ''}` +
    `${address ? `<address xsi:type="xsd:string">${address}</address>` : ''}` +
    '</contactInformation>'
  )
}

export function censorCodeInfo(data) {
  if (!(data && typeof data === 'object')) return ''

  const censorCode = data.censorCode
  const censorCodeDescription = data.censorCodeDescription

  return (
    '<censorCode>' +
    `${censorCode ? `<censorCode>${censorCode}</censorCode>` : ''}` +
    `${
      censorCodeDescription
        ? `<censorCodeDescription>${censorCodeDescription}</censorCodeDescription>`
        : ''
    }` +
    '</censorCode>'
  )
}

export function getValuesResultStart() {
  return '<GetValuesResult>'
}
export function getValuesResultEnd() {
  return '</GetValuesResult>'
}
