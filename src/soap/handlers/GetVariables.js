import { encodeXML } from 'entities'
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
  responseStart,
  soapBodyEnd,
  soapEnvelopeEnd
} from '../serializers/common.js'
import {
  variablesResultStart,
  variablesResponseStart,
  variablesStart,
  variableStart,
  variableInfoType,
  variableEnd,
  variablesEnd,
  variablesResponseEnd,
  variablesResultEnd
} from '../serializers/variable.js'
import {
  queryInfoStart,
  queryInfoType,
  queryInfoNote,
  queryInfoEnd
} from '../serializers/query.js'

export async function* getVariables(
  request,
  { date = new Date(), helpers, method, uniqueid }
) {
  const org =
    typeof request.params.org === 'string'
      ? helpers.org(request.params.org)
      : undefined

  // Fetch organization
  const organization = org
    ? await helpers.findOneCached('organizations', '', {
        slug: helpers.safeName(org)
      })
    : undefined

  const unitCV = await helpers.getUnitCV()

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetVariablesResponse') +
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
    responseStart('GetVariablesResponse') +
    variablesResultStart() +
    encodeXML(
      variablesResponseStart({ isObject: false }) +
        queryInfoStart() +
        queryInfoType({
          date,
          method,
          parameters: [['variable']]
        }) +
        queryInfoNote({ note: 'OD Web Service' }) +
        queryInfoEnd()
    )

  // Fetch datastreams
  const datastreamsParams = Object.assign(
    {
      is_enabled: true,
      is_hidden: false,
      $limit: 2000,
      $sort: { _id: 1 }
    },
    organization &&
      organization.data &&
      organization.data.length &&
      organization.data[0]._id
      ? { organization_id: organization.data[0]._id }
      : undefined
  )
  let datastreams = await helpers.findMany('datastreams', datastreamsParams)

  if (datastreams && datastreams.length) {
    yield encodeXML(variablesStart())
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

        yield encodeXML(
          variableStart() +
            variableInfoType({ datastream, refsMap, unitCV }) +
            variableEnd()
        )
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
        datastreamsParams
      )
    )
  }

  if (variableCodes.size || (datastreams && datastreams.length)) {
    yield encodeXML(variablesEnd())
  }

  yield encodeXML(variablesResponseEnd()) +
    variablesResultEnd() +
    '</GetVariablesResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getVariables(request, ctx), {
        autoDestroy: true
      })
    )
}
