// datastream grouped by variableCode
export async function getvariables({ helpers, params, variableCodes }) {
  let datastreams = await helpers.findMany('datastreams', params)
  const variables = new Map()

  while (datastreams && datastreams.length) {
    let i = 0

    for (const datastream of datastreams) {
      const refsMap =
        datastream && datastream.external_refs
          ? helpers.externalRefsMap(datastream.external_refs)
          : undefined
      const variableCode =
        refsMap && refsMap.get('his.odm.variables.VariableCode')

      if (variableCode && !variableCodes.has(variableCode)) {
        variableCodes.add(variableCode)
        variables.set(variableCode, [datastream])
      } else if (variableCode && variableCodes.has(variableCode)) {
        variables.get(variableCode).push(datastream)
      }

      // Stay async friendly; scan 200 at a time (hardcoded)
      i++
      if (!(i % 200)) await new Promise(resolve => setImmediate(resolve))
    }

    // Fetch next page
    datastreams = await helpers.findMany(
      'datastreams',
      Object.assign(
        {
          _id: { $gt: datastreams[datastreams.length - 1]._id }
        },
        params
      )
    )
  }

  return variables
}
