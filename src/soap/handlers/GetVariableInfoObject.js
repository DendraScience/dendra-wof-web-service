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
import { genDatastreams } from '../../lib/datastream.js'

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
          $and: [
            {
              external_refs: {
                $elemMatch: {
                  type: 'his.odm.variables.VariableCode',
                  identifier: { $regex: `^${variableParts[1]}$` }
                }
              }
            }
          ]
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

  const organizationRefsMap =
    organization && organization.external_refs
      ? helpers.externalRefsMap(organization.external_refs)
      : undefined

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

  if (!datastream.done) {
    yield variablesStart()
  }

  while (!datastream.done) {
    const datastreamValue = datastream.value
    const refsMap =
      datastreamValue && datastreamValue.external_refs
        ? helpers.externalRefsMap(datastreamValue.external_refs)
        : undefined

    yield variableStart() +
      variableInfoType({
        datastream: datastreamValue,
        organizationRefsMap,
        refsMap,
        unitCV
      }) +
      variableEnd()

    if (!variableValue) {
      datastream = await datastreams.next()
    } else {
      break
    }
  }

  if (variableCodes.size || datastream.value) {
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
