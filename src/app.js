/**
 * WaterOneFlow Web Service app.
 *
 * @author J. Scott Smith
 * @license BSD-3-Clause
 * @module app
 */

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import qs from 'qs'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import xmlBodyParser from 'fastify-xml-body-parser'
import Agent, { HttpsAgent } from 'agentkeepalive'
import LRU from 'lru-cache'
import httpErrors from 'http-errors'
import soapMethodHandlers from './soap/handlers/methods.js'
import { soapErrorHandler } from './soap/handlers/common.js'
import { SoapRequestSchema } from './soap/schemas.js'
import { createHelpers } from './lib/helpers.js'
import { CacheControls, ContentTypes, Headers } from './lib/utils.js'

const { NotFound } = httpErrors

const SERVICE_1_1 = 'cuahsi_1_1'
const ORG_REGEXP_STR = '^[A-Za-z][A-Za-z0-9-_]{2,}[A-Za-z0-9]$'

export default async logger => {
  const app = {}

  const handleGet = async (request, reply, { service }) => {
    if (
      request.query &&
      Object.keys(request.query).find(key => key.toLowerCase() === 'wsdl')
    ) {
      request.log.info('Handling web service GET request for WSDL')

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

    request.log.info(`Handling web service POST request for method ${method}`)

    if (!method) throw new Error('Method required')

    // NOTE: Good to go since the schema validated the body
    return soapMethodHandlers[method](
      request,
      reply,
      Object.assign({ method, parameters }, ctx)
    )
  }

  // App setup
  app.start = async () => {
    const cache = new LRU({
      max: 200,
      ttl: 1000 * 60 * 10,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    })
    const webAPI = axios.create({
      baseURL: process.env.WEB_API_URL || 'https://api.dendra.science/v2',
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
    webAPI.interceptors.request.use(request => {
      logger.info(
        `Web API request ${request.method.toUpperCase()} ${request.url}`
      )
      return request
    })

    const helpers = createHelpers({ cache, webAPI })

    /*
      Set up web service and routes.
     */
    const fastify = Fastify({ logger })

    fastify.register(cors, {
      exposedHeaders: ['Accept', 'Content-Type', 'Origin', 'X-Requested-With']
    })
    fastify.register(xmlBodyParser)

    // Root routes
    fastify.get(
      `/${SERVICE_1_1}`,
      { prefixTrailingSlash: 'both' },
      async (request, reply) => {
        return handleGet(request, reply, {
          service: SERVICE_1_1
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
          cache,
          helpers,
          service: SERVICE_1_1
        })
      }
    )

    // Org slug routes
    fastify.get(
      `/:org(${ORG_REGEXP_STR})/${SERVICE_1_1}`,
      { prefixTrailingSlash: 'both' },
      async (request, reply) => {
        return handleGet(request, reply, {
          service: SERVICE_1_1
        })
      }
    )
    fastify.post(
      `/:org(${ORG_REGEXP_STR})/${SERVICE_1_1}`,
      {
        errorHandler: soapErrorHandler,
        prefixTrailingSlash: 'both',
        schema: SoapRequestSchema
      },
      async (request, reply) => {
        return handlePost(request, reply, {
          cache,
          helpers,
          service: SERVICE_1_1
        })
      }
    )

    await fastify.listen({
      port: process.env.PORT | 0,
      host: process.env.HOST || 'localhost'
    })

    app.fastify = fastify
  }

  app.stop = () => app.fastify && app.fastify.close()

  return app
}
