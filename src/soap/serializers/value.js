import { encodeXML } from 'entities'
import { timeOffset } from './time.js'

export function timeSeriesResponseStart({
  hasAttribute = false,
  isSiteObject = false
}) {
  return `<timeSeriesResponse${
    hasAttribute
      ? ` xmlns:gml="http://www.opengis.net/gml"` +
        ` xmlns:xlink="http://www.w3.org/1999/xlink"` +
        ` xmlns:xsd="http://www.w3.org/2001/XMLSchema"` +
        ` xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"` +
        ` xmlns:wtr="http://www.cuahsi.org/waterML/"` +
        ` xmlns="http://www.cuahsi.org/waterML/1.1/"`
      : ``
  }${isSiteObject ? ` xmlns="http://www.cuahsi.org/waterML/1.1/"` : ''}>`
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
  methodID,
  sourceID,
  qualityControlLevelCode
}) {
  if (!(datapoint && typeof datapoint === 'object')) return ''

  const censorCode = datapoint.d && datapoint.d.CensorCode

  const dateTimeUTC = new Date(datapoint.t).toISOString().substring(0, 19)
  const value = datapoint.v
  const utcTimeOffset = datapoint.d && timeOffset(datapoint.d.UTCOffset)
  const dateTime = new Date(datapoint.t + 3600000 * datapoint.d.UTCOffset)
    .toISOString()
    .substring(0, 19)

  return `<value${censorCode ? ` censorCode="${encodeXML(censorCode)}"` : ''}${
    dateTime ? ` dateTime="${dateTime}"` : ''
  }${utcTimeOffset ? ` timeOffset="${utcTimeOffset}"` : ''}${
    dateTimeUTC ? ` dateTimeUTC="${dateTimeUTC}"` : ''
  }${methodID ? ` methodCode="${encodeXML(methodID)}"` : ''}${
    sourceID ? ` sourceCode="${encodeXML(sourceID)}"` : ''
  }${
    qualityControlLevelCode
      ? ` qualityControlLevelCode="${encodeXML(qualityControlLevelCode)}"`
      : ''
  }>${value === null ? -9999 : value}</value>`
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
    `${
      topicCategory
        ? `<topicCategory>${encodeXML(topicCategory)}</topicCategory>`
        : ''
    }` +
    `${title ? `<title>${encodeXML(title)}</title>` : ''}` +
    `${abstract ? `<abstract>${encodeXML(abstract)}</abstract>` : ''}` +
    `${
      profileVersion
        ? `<profileVersion>${encodeXML(profileVersion)}</profileVersion>`
        : ''
    }` +
    `${
      metadataLink
        ? `<metadataLink>${encodeXML(metadataLink)}</metadataLink>`
        : ''
    }` +
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
    `${
      contactName ? `<contactName>${encodeXML(contactName)}</contactName>` : ''
    }` +
    `${
      typeOfContact
        ? `<typeOfContact>${encodeXML(typeOfContact)}</typeOfContact>`
        : ''
    }` +
    `${email ? `<email>${encodeXML(email)}</email>` : ''}` +
    `${phone ? `<phone>${encodeXML(phone)}</phone>` : ''}` +
    `${
      address
        ? `<address xsi:type="xsd:string">${encodeXML(address)}</address>`
        : ''
    }` +
    '</contactInformation>'
  )
}

export function censorCodeInfo(data) {
  if (!(data && typeof data === 'object')) return ''

  const censorCode = data.censorCode
  const censorCodeDescription = data.censorCodeDescription

  return (
    '<censorCode>' +
    `${censorCode ? `<censorCode>${encodeXML(censorCode)}</censorCode>` : ''}` +
    `${
      censorCodeDescription
        ? `<censorCodeDescription>${encodeXML(
            censorCodeDescription
          )}</censorCodeDescription>`
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
