/**
 * Generic Webhook to SFTP Upload CLI app.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module app
 */

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const qs = require('qs')
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const { NotFound } = require('http-errors')
const soapMethodHandlers = require('./soap/handlers/methods')
const { soapErrorHandler } = require('./soap/handlers/common')
const { SoapRequestSchema } = require('./soap/schemas')
const { CacheControls, ContentTypes, Headers } = require('./lib/utils')

const SERVICE_1_1 = 'cuahsi_1_1'
const SLUG_REGEXP_STR = '^[a-z][a-z0-9-]{2,}[a-z0-9]$'

module.exports = async log => {
  const app = {}

  const handleGet = async (request, reply, { service }) => {
    if (
      request.query &&
      Object.keys(request.query).find(key => key.toLowerCase() === 'wsdl')
    ) {
      log.info('Hnadling web service GET request for WSDL')

      reply
        .header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0)
        .header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8)
        .send(
          fs.createReadStream(
            path.resolve(__dirname, '../wsdl', `${service}.xml`),
            'utf8'
          )
        )
      return
    }

    throw new NotFound()
  }

  const handlePost = async (request, reply, ctx) => {
    const soapBody = request.body['soap:Envelope']['soap:Body']
    const method = Object.keys(soapBody)[0]
    const parameters = soapBody[method]

    log.info(`Handling web service POST request for method ${method}`)

    // NOTE: Good to go since the schema validated the body
    return soapMethodHandlers[method](
      request,
      reply,
      Object.assign({ method, parameters }, ctx)
    )
  }

  // App setup
  app.eval = async p => {
    const webAPI = axios.create({
      baseURL: p.web_api_url,
      httpAgent: new Agent({
        timeout: 60000,
        freeSocketTimeout: 30000
      }),
      httpsAgent: new HttpsAgent({
        timeout: 60000,
        freeSocketTimeout: 30000
      }),
      maxRedirects: 0,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      },
      timeout: 90000
    })

    const fastify = require('fastify')()

    fastify.register(require('fastify-cors'), {
      exposedHeaders: ['Accept', 'Content-Type', 'Origin', 'X-Requested-With']
    })
    fastify.register(require('fastify-xml-body-parser'))

    // Root routes
    fastify.get(
      `/${SERVICE_1_1}`,
      { prefixTrailingSlash: 'both' },
      async (request, reply) => {
        return handleGet(request, reply, {
          logger: log,
          p,
          service: SERVICE_1_1,
          webAPI
        })
      }
    )
    fastify.post(
      `/${SERVICE_1_1}`,
      {
        errorHandler: soapErrorHandler,
        prefixTrailingSlash: 'both',
        schema: SoapRequestSchema
      },
      async (request, reply) => {
        return handlePost(request, reply, {
          logger: log,
          p,
          service: SERVICE_1_1,
          webAPI
        })
      }
    )

    // Org slug routes
    fastify.get(
      `/:org(${SLUG_REGEXP_STR})/${SERVICE_1_1}`,
      { prefixTrailingSlash: 'both' },
      async (request, reply) => {
        return handleGet(request, reply, {
          logger: log,
          p,
          service: SERVICE_1_1,
          webAPI
        })
      }
    )
    fastify.post(
      `/:org(${SLUG_REGEXP_STR})/${SERVICE_1_1}`,
      {
        errorHandler: soapErrorHandler,
        prefixTrailingSlash: 'both',
        schema: SoapRequestSchema
      },
      async (request, reply) => {
        return handlePost(request, reply, {
          logger: log,
          p,
          service: SERVICE_1_1,
          webAPI
        })
      }
    )

    const address = await fastify.listen(p.port, p.host)

    log.info(`Web service listening on ${address}`)

    app.fastify = fastify
  }

  app.stop = () => app.fastify && app.fastify.close()

  return app
}
