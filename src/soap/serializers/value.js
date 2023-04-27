import { encodeXML } from 'entities'
import { timeOffset } from './time.js'
import { unitsType } from './common.js'

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
  annotationAttrib,
  annotationFlags,
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
  const offsetTypeCode =
    annotationFlags && annotationFlags.get('his.odm.offsettypes.OffsetTypeCode')
  const qualifiers =
    annotationFlags && annotationFlags.get('his.odm.qualifiers.QualifierCode')
  const offsetValue = annotationAttrib && annotationAttrib.value
  const labSampleCode =
    annotationFlags && annotationFlags.get('his.odm.samples.LabSampleCode')

  return `<value${qualifiers ? ` qualifiers="${encodeXML(qualifiers)}"` : ''}${
    censorCode ? ` censorCode="${encodeXML(censorCode)}"` : ''
  }${dateTime ? ` dateTime="${dateTime}"` : ''}${
    utcTimeOffset ? ` timeOffset="${utcTimeOffset}"` : ''
  }${dateTimeUTC ? ` dateTimeUTC="${dateTimeUTC}"` : ''}${
    methodID ? ` methodCode="${encodeXML(methodID)}"` : ''
  }${sourceID ? ` sourceCode="${encodeXML(sourceID)}"` : ''}${
    offsetValue ? ` offsetValue="${offsetValue}"` : ''
  }${offsetTypeCode ? ` offsetTypeCode="${encodeXML(offsetTypeCode)}"` : ''}${
    labSampleCode ? ` labSampleCode="${encodeXML(labSampleCode)}"` : ''
  }${
    qualityControlLevelCode
      ? ` qualityControlLevelCode="${encodeXML(qualityControlLevelCode)}"`
      : ''
  }>${value === null ? -9999 : value}</value>`
}

export function metadataInfoType(stationRefsMap) {
  if (!(stationRefsMap && typeof stationRefsMap === 'object')) return ''

  const topicCategory =
    stationRefsMap && stationRefsMap.get('his.odm.isometadata.TopicCategory')
  const title =
    stationRefsMap && stationRefsMap.get('his.odm.isometadata.Title')
  const abstract =
    stationRefsMap && stationRefsMap.get('his.odm.isometadata.Abstract')
  const profileVersion =
    stationRefsMap && stationRefsMap.get('his.odm.isometadata.ProfileVersion')
  const metadataLink =
    stationRefsMap && stationRefsMap.get('his.odm.isometadata.MetadataLink')

  // Preventing empty metadata Object
  if (
    !topicCategory &&
    !title &&
    !abstract &&
    !profileVersion &&
    !profileVersion &&
    !metadataLink
  ) {
    return ''
  }

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

export function qualifierInfo({ refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const qualifierCode =
    refsMap && refsMap.get('his.odm.qualifiers.QualifierCode')
  const qualifierDescription =
    refsMap && refsMap.get('his.odm.qualifiers.QualifierDescription')

  return (
    '<qualifier>' +
    `${
      qualifierCode
        ? `<qualifierCode>${encodeXML(qualifierCode)}</qualifierCode>`
        : ''
    }` +
    `${
      qualifierDescription
        ? `<qualifierDescription>${encodeXML(
            qualifierDescription
          )}</qualifierDescription>`
        : ''
    }` +
    '</qualifier>'
  )
}

export function offsetInfo({ annotation, unitCV }) {
  if (!(annotation && typeof annotation === 'object')) return ''

  const annotationFlags = annotation.annotationFlags
  const offsetTypeID =
    annotationFlags && annotationFlags.get('his.odm.offsettypes.OffsetTypeID')
  const offsetTypeCode =
    annotationFlags && annotationFlags.get('his.odm.offsettypes.OffsetTypeCode')
  const offsetDescription =
    annotationFlags &&
    annotationFlags.get('his.odm.offsettypes.OffsetDescription')
  const offsetIsVertical =
    annotationFlags &&
    annotationFlags.get('his.odm.offsettypes.OffsetIsVertical')

  return (
    `<offset ${
      offsetTypeID ? `offsetTypeID="${encodeXML(offsetTypeID)}"` : ''
    }>` +
    `${
      offsetTypeCode
        ? `<offsetTypeCode>${encodeXML(offsetTypeCode)}</offsetTypeCode>`
        : ''
    }` +
    `${
      offsetDescription
        ? `<offsetDescription>${encodeXML(
            offsetDescription
          )}</offsetDescription>`
        : ''
    }` +
    '<unit>' +
    unitsType(unitCV[annotation.annotationAttrib.unit_tag]) +
    '</unit>' +
    `${
      offsetIsVertical
        ? `<offsetIsVertical>${encodeXML(offsetIsVertical)}</offsetIsVertical>`
        : ''
    }` +
    '</offset>'
  )
}

export function sampleInfo({ refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const sampleID = refsMap && refsMap.get('his.odm.samples.SampleID')
  const labSampleCode = refsMap && refsMap.get('his.odm.samples.LabSampleCode')
  const sampleType = refsMap && refsMap.get('his.odm.samples.SampleType')

  return (
    `<sample${sampleID ? ` sampleID="${encodeXML(sampleID)}"` : ''}>` +
    `${
      labSampleCode
        ? `<labSampleCode>${encodeXML(labSampleCode)}</labSampleCode>`
        : ''
    }` +
    `${sampleType ? `<sampleType>${encodeXML(sampleType)}</sampleType>` : ''}` +
    labMethodInfo({ refsMap }) +
    `</sample>`
  )
}

export function labMethodInfo({ refsMap }) {
  if (!(refsMap && typeof refsMap === 'object')) return ''

  const labSampleCode = refsMap && refsMap.get('his.odm.samples.LabSampleCode')
  const labName = refsMap && refsMap.get('his.odm.labmethods.LabName')
  const labOrganization =
    refsMap && refsMap.get('his.odm.labmethods.LabOrganization')
  const labMethodName =
    refsMap && refsMap.get('his.odm.labmethods.LabMethodName')
  const labMethodDescription =
    refsMap && refsMap.get('his.odm.labmethods.LabMethodDescription')
  const labMethodLink =
    refsMap && refsMap.get('his.odm.labmethods.LabMethodLink')

  if (
    !labSampleCode &&
    !labName &&
    !labOrganization &&
    !labMethodName &&
    !labMethodDescription &&
    !labMethodLink
  ) {
    return ''
  }

  return (
    `<labMethod>` +
    `${labSampleCode ? `<labCode>${encodeXML(labSampleCode)}</labCode>` : ''}` +
    `${labName ? `<labName>${encodeXML(labName)}</labName>` : ''}` +
    `${
      labOrganization
        ? `<labOrganization>${encodeXML(labOrganization)}</labOrganization>`
        : ''
    }` +
    `${
      labMethodName
        ? `<labMethodName>${encodeXML(labMethodName)}</labMethodName>`
        : ''
    }` +
    `${
      labMethodDescription
        ? `<labMethodDescription>${encodeXML(
            labMethodDescription
          )}</labMethodDescription>`
        : ''
    }` +
    `${
      labMethodLink
        ? `<labMethodLink>${encodeXML(labMethodLink)}</labMethodLink>`
        : ''
    }` +
    `</labMethod>`
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

  const censorCode = data.term
  const censorCodeDescription = data.definition

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
