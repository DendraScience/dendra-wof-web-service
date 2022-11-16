export async function* datastream({ helpers, logger, merge = false, params }) {
  try {
    let datastreamsList = []
    let datastreams = await helpers.findMany('datastreams', params)
    datastreamsList = datastreams

    while (datastreams.length) {
      datastreams = await helpers.findMany(
        'datastreams',
        Object.assign(
          {
            _id: { $gt: datastreams[datastreams.length - 1]._id }
          },
          params
        )
      )

      datastreamsList.push(...datastreams)
    }

    if (!merge) return datastreamsList

    const variables = new Map()

    for (const data of datastreamsList) {
      const variableCode = data.external_refs.find(
        item => item.type === 'his.odm.variables.VariableCode'
      ).identifier

      if (variableCode && !variables.has(variableCode)) {
        variables.set(variableCode, [data])
      } else if (variableCode && variables.has(variableCode)) {
        variables.get(variableCode).push(data)
      }
    }

    return variables
  } catch (error) {
    logger.error(error)
  }
}
