import { CacheControls, ContentTypes, Headers } from '../../lib/utils.js'
import { soapFault } from '../serializers/common.js'

export function soapErrorHandler(error, _request, reply) {
  reply
    .status(500)
    .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
    .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
    .send(soapFault(error))
}
