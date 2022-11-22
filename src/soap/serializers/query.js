import { encodeXML } from 'entities'

export function queryInfoStart() {
  return '<queryInfo>'
}

export function queryInfoEnd() {
  return '</queryInfo>'
}

// GetVariableInfo/Object have variableParam tag
export function queryInfoType({
  date = new Date(),
  method,
  parameters,
  variableParam
}) {
  switch (method) {
    case 'GetSitesObject':
      method = 'GetSites'
      break
    case 'GetVariables':
    case 'GetVariablesObject':
    case 'GetVariableInfo':
    case 'GetVariableInfoObject':
      method = 'GetVariableInfo'
      break
    case 'GetSiteInfoObject':
    case 'GetSiteInfoMultpleObject':
      method = 'GetSiteInfo'
      break
    case 'GetValuesObject':
      method = 'GetValues'
      break
    case 'GetValuesForASiteObject':
      method = 'GetValuesForASite'
      break
    case 'GetSitesByBoxObject':
      method = 'GetSitesByBox'
      break
  }

  return (
    `<creationTime>${date.toISOString()}</creationTime>` +
    `<criteria MethodCalled="${method}">` +
    `${
      variableParam ? `<variableParam>${variableParam}</variableParam>` : ''
    }` +
    parameters
      .map(parameter => {
        return parameter
          ? `<parameter name="${parameter[0]}" ${
              parameter[1] ? `value="${encodeXML(parameter[1])}"` : ''
            }/>`
          : ''
      })
      .join('') +
    '</criteria>'
  )
}

export function queryInfoNote({ note, visible = true }) {
  if (!(note && typeof note === 'string')) return ''

  return visible ? `<note>${note}</note>` : ''
}
