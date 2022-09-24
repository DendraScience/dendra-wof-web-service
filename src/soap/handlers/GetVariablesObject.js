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
  variableDetails,
  variableEnd,
  variablesEnd,
  variablesResponseEnd
} from '../serializers/variable.js'
import {
  queryInfoStart,
  queryInfoType,
  queryInfoEnd
} from '../serializers/query.js'

export async function* getVariablesObject(
  request,
  { date = new Date(), helpers, method, parameters, uniqueid }
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

  // Fetch Datastreams
  const datastreams = await helpers.findMany(
    'datastreams',
    Object.assign(
      {
        is_enabled: true,
        is_hidden: false,
        // TODO: Paginate to allow for more than 2000
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
  )
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
    variablesResponseStart() +
    queryInfoStart() +
    queryInfoType({
      date,
      method,
      parameters: [['authToken', parameters.authToken]]
    }) +
    queryInfoEnd() +
    variablesStart()

  for (const datastream of datastreams) {
    const refsMap =
      datastream && datastream.external_refs
        ? helpers.externalRefsMap(datastream.external_refs)
        : undefined
    yield variableStart() +
      variableDetails({ datastream, refsMap, unitCV }) +
      variableEnd()
  }

  yield variablesEnd() +
    variablesResponseEnd() +
    '</GetVariablesResponse>' +
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
