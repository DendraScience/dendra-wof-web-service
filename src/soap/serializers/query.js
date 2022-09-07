import { encodeXML } from 'entities'

export function queryInfoStart() {
  return '<queryInfo>'
}

export function queryInfoEnd() {
  return '</queryInfo>'
}

export function queryInfoType({ method, parameters }) {
  return (
    `<creationTime>${new Date(1661964219333).toISOString()}</creationTime>` +
    `<criteria MethodCalled="${method}">` +
    parameters
      .map(parameter =>
        !parameter[1]
          ? ''
          : `<parameter name="${parameter[0]}" value="${encodeXML(
              parameter[1] + ''
            )}"/>`
      )
      .join('') +
    '</criteria>'
  )
}
