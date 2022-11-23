export async function* genDatastreams({ helpers, params, variableCodes }) {
  let count = 0
  let datastreams = await helpers.findMany('datastreams', params)

  while (datastreams && datastreams.length) {
    let i = 0

    for (const datastream of datastreams) {
      count++
      if (!variableCodes) {
        yield datastream
      } else {
        // Normalize datastreams to unique variables if requested
        const refsMap =
          datastream && datastream.external_refs
            ? helpers.externalRefsMap(datastream.external_refs)
            : undefined
        const variableCode =
          refsMap && refsMap.get('his.odm.variables.VariableCode')

        if (variableCode && !variableCodes.has(variableCode)) {
          variableCodes.add(variableCode)
          yield datastream
        }
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

  return count
}
