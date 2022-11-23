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
import { genDatastreams } from '../../lib/datastream.js'

export async function* getVariablesObject(
  request,
  { date = new Date(), helpers, method, uniqueid }
) {
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
      $limit: 2000,
      $sort: { _id: 1 }
    },
    organization ? { organization_id: organization._id } : undefined
  )
  const variableCodes = new Set()
  const datastreams = await genDatastreams({
    helpers,
    params: datastreamsParams,
    variableCodes
  })

  yield soapEnvelopeStart() +
    soapHeaderStart() +
    soapWsaAction('GetVariablesObjectResponse') +
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
    responseStart('GetVariablesObjectResponse') +
    variablesResponseStart({ isObject: true }) +
    queryInfoStart() +
    queryInfoType({
      date,
      method,
      parameters: [['variable']]
    }) +
    queryInfoNote({ note: 'OD Web Service' }) +
    queryInfoEnd()

  let datastream = await datastreams.next()

  if (!datastream.done) {
    yield variablesStart()
  }

  while (!datastream.done) {
    const datastreamValue = datastream.value
    const refsMap = datastreamValue.external_refs
      ? helpers.externalRefsMap(datastreamValue.external_refs)
      : undefined

    yield variableStart() +
      variableInfoType({ datastream: datastreamValue, refsMap, unitCV }) +
      variableEnd()

    datastream = await datastreams.next()
  }

  if (variableCodes.size || datastream.value) {
    yield variablesEnd()
  }

  yield variablesResponseEnd() +
    '</GetVariablesObjectResponse>' +
    soapBodyEnd() +
    soapEnvelopeEnd()
}

export default async (request, reply, ctx) => {
  return reply
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(
      Readable.from(getVariablesObject(request, ctx), {
        autoDestroy: true
      })
    )
}
