const entities = require('entities')

function queryInfo({ method, parameters }) {
  return (
    '<queryInfo>' +
    `<creationTime>${new Date().toISOString()}</creationTime>` +
    `<criteria MethodCalled="${method}">` +
    Object.entries(parameters)
      .map(
        entry =>
          `<parameter name="${entry[0]}" value="${entities.encodeXML(
            entry[1]
          )}"/>`
      )
      .join('') +
    '</criteria>' +
    '</queryInfo>'
  )
}

module.exports = {
  queryInfo
}
