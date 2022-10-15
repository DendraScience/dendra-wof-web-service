import { Readable } from 'stream'
import { CacheControls, ContentTypes, Headers, uuid } from '../../lib/utils.js'
import {
  soapEnvelopeStart,
  soapHeaderStart,
  soapWsaAction,
  soapWsaMessageID,
  soapWsaRelatesTo,
  soapWsaTo,
  soapWsuInfo,
  soapWsseSecurityStart,
  soapWsseSecurityEnd,
  soapWsuTimestampStart,
  soapWsuTimestampEnd,
  soapHeaderEnd,
  soapBodyStart,
  responseWaterMLStart,
  soapBodyEnd,
  soapEnvelopeEnd
} from '../serializers/common.js'
import {
  variablesResponseStart,
  variablesStart,
  variableStart,
  variableInfoType,
  variableEnd,
  variablesEnd,
  variablesResponseEnd
} from '../serializers/variable.js'
import {
  queryInfoStart,
  queryInfoType,
  queryInfoNote,
  queryInfoEnd
} from '../serializers/query.js'

export async function* getVariableInfoObject(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
) {
  const { variable } = parameters
  const variableValue = variable && variable.length ? variable[0] : undefined
  const variableParts = variableValue && variableValue.split(':')
  const org =
    typeof request.params.org === 'string'
      ? helpers.org(request.params.org)
      : undefined

  // Fetch organization
  const organization = org
    ? await helpers.findMany('organizations', {
        slug: helpers.slugify(org),
        $limit: 1
      })
    : undefined

  const unitCV = await helpers.getUnitCV()

  // Fetch datastreams
  const datastreamsParams = Object.assign(
    {
      is_enabled: true,
      state: 'ready',
      $limit: variableParts ? 1 : 2000,
      $sort: { _id: 1 }
    },
    organization && organization.length && organization[0]._id
      ? { organization_id: organization[0]._id }
      : undefined,
    variableParts
      ? {
          'external_refs.type': 'his.odm.variables.VariableCode',
          'external_refs.identifier': variableParts[1]
        }
      : undefined
  )
  let datastreams = await helpers.findMany('datastreams', datastreamsParams)

  if (!datastreams.length) throw new Error('Datastream not found')

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetVariableInfoObjectResponse') +
    soapWsaMessageID(uniqueid || uuid()) +
    soapWsaRelatesTo(uniqueid || uuid()) +
    soapWsaTo() +
    soapWsseSecurityStart() +
    soapWsuTimestampStart(uniqueid || uuid()) +
    soapWsuInfo({ date }) +
    soapWsuTimestampEnd() +
    soapWsseSecurityEnd() +
    soapHeaderEnd() +
    soapBodyStart() +
    responseWaterMLStart('VariablesResponse') +
    variablesResponseStart({ hasAttribute: false, isObject: true }) +
    queryInfoStart() +
    queryInfoType({
      date,
      method,
      parameters: [['variable', variableValue || undefined]],
      variableParam: variableValue || undefined
    }) +
    queryInfoNote({ note: 'OD Web Service' }) +
    queryInfoEnd()

  if (datastreams && datastreams.length) {
    yield variablesStart()
  }

  const variableCodes = new Set()

  while (datastreams.length) {
    let i = 0

    for (const datastream of datastreams) {
      const refsMap =
        datastream && datastream.external_refs
          ? helpers.externalRefsMap(datastream.external_refs)
          : undefined
      const variableCode =
        refsMap && refsMap.get('his.odm.variables.VariableCode')

      // Normalize datastreams to unique variables
      if (variableCode && !variableCodes.has(variableCode)) {
        variableCodes.add(variableCode)

        yield variableStart() +
          variableInfoType({ datastream, refsMap, unitCV }) +
          variableEnd()
      }

      // Stay async friendly; scan 200 at a time (hardcoded)
      i++
      if (!(i % 200)) await new Promise(resolve => setImmediate(resolve))
    }

    // Fetch next page ; fetch if variable have not provided
    datastreams = !variableValue
      ? await helpers.findMany(
          'datastreams',
          Object.assign(
            {
              _id: { $gt: datastreams[datastreams.length - 1]._id }
            },
            datastreamsParams
          )
        )
      : []
  }

  if (variableCodes.size || (datastreams && datastreams.length)) {
    yield variablesEnd()
  }

  yield variablesResponseEnd() +
    '</VariablesResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getVariableInfoObject(request, ctx), {
        autoDestroy: true
      })
    )
}
