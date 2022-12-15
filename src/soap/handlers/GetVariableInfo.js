import { Readable } from 'stream'
import { encodeXML } from 'entities'
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
  getVariableInfoResultStart,
  variablesResponseStart,
  variablesStart,
  variableStart,
  variableInfoType,
  variableEnd,
  variablesEnd,
  variablesResponseEnd,
  getVariableInfoResultEnd
} from '../serializers/variable.js'
import {
  queryInfoStart,
  queryInfoType,
  queryInfoNote,
  queryInfoEnd
} from '../serializers/query.js'
import { genDatastreams } from '../../lib/datastream.js'

export async function* getVariableInfo(
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
  let organization
  if (org) {
    const organizations = await helpers.findMany('organizations', {
      slug: helpers.slugify(org),
      $limit: 1
    })
    if (!organizations.length) throw new Error('Organization not found')
    organization = organizations[0]
  }

  const unitCV = await helpers.getUnitCV()

  // Fetch datastreams
  const datastreamsParams = Object.assign(
    {
      is_enabled: true,
      state: 'ready',
      $limit: variableParts ? 1 : 2000,
      $sort: { _id: 1 }
    },
    organization ? { organization_id: organization._id } : undefined,
    variableParts
      ? {
          'external_refs.type': 'his.odm.variables.VariableCode',
          'external_refs.identifier': variableParts[1]
        }
      : undefined
  )
  const variableCodes = new Set()
  const datastreams = await genDatastreams({
    helpers,
    params: datastreamsParams,
    variableCodes
  })
  let datastream = await datastreams.next()

  if (!datastream.value) throw new Error('Datastream not found')

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetVariableInfoResponse') +
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
    responseStart('GetVariableInfoResponse') +
    getVariableInfoResultStart() +
    encodeXML(
      variablesResponseStart({ isObject: false, hasXMLSchema: true }) +
        queryInfoStart() +
        queryInfoType({
          date,
          method,
          parameters: [['variable', variableValue || undefined]],
          variableParam: variableValue || undefined
        }) +
        queryInfoNote({ note: 'OD Web Service' }) +
        queryInfoEnd()
    )

  if (!datastream.done) {
    yield encodeXML(variablesStart())
  }

  while (!datastream.done) {
    const datastreamValue = datastream.value
    const refsMap =
      datastreamValue && datastreamValue.external_refs
        ? helpers.externalRefsMap(datastreamValue.external_refs)
        : undefined

    yield encodeXML(
      variableStart() +
        variableInfoType({ datastream: datastreamValue, refsMap, unitCV }) +
        variableEnd()
    )

    if (!variableValue) {
      datastream = await datastreams.next()
    } else {
      break
    }
  }

  if (variableCodes.size || datastream.value) {
    yield encodeXML(variablesEnd())
  }

  yield encodeXML(variablesResponseEnd()) +
    getVariableInfoResultEnd() +
    '</GetVariableInfoResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getVariableInfo(request, ctx), {
        autoDestroy: true
      })
    )
}
