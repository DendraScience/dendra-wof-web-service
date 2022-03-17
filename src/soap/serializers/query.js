const entities = require('entities')

function queryInfoStart() {
  return '<queryInfo>'
}

function queryInfoEnd() {
  return '</queryInfo>'
}

function queryInfoType({ method, parameters }) {
  return (
    `<creationTime>${new Date().toISOString()}</creationTime>` +
    `<criteria MethodCalled="${method}">` +
    parameters
      .map(parameter =>
        !parameter[1]
          ? ''
          : `<parameter name="${parameter[0]}" value="${entities.encodeXML(
              parameter[1] + ''
            )}"/>`
      )
      .join('') +
    '</criteria>'
  )
}

module.exports = {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
}
