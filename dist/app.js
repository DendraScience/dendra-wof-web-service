"use strict";

/**
 * WaterOneFlow Web Service CLI app.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module app
 */
const fs = require('fs');

const path = require('path');

const axios = require('axios');

const qs = require('qs');

const Agent = require('agentkeepalive');

const LRU = require('lru-cache');

const {
  HttpsAgent
} = require('agentkeepalive');

const {
  NotFound
} = require('http-errors');

const soapMethodHandlers = require('./soap/handlers/methods');

const {
  soapErrorHandler
} = require('./soap/handlers/common');

const {
  SoapRequestSchema
} = require('./soap/schemas');

const {
  CacheControls,
  ContentTypes,
  Headers
} = require('./lib/utils');

const SERVICE_1_1 = 'cuahsi_1_1';
const SLUG_REGEXP_STR = '^[a-z][a-z0-9-]{2,}[a-z0-9]$';

module.exports = async log => {
  const app = {};

  const handleGet = async (request, reply, {
    service
  }) => {
    if (request.query && Object.keys(request.query).find(key => key.toLowerCase() === 'wsdl')) {
      log.info('Hnadling web service GET request for WSDL');
      reply.header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0).header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8).send(fs.createReadStream(path.resolve(__dirname, '../wsdl', `${service}.xml`), 'utf8'));
      return;
    }

    throw new NotFound();
  };

  const handlePost = async (request, reply, ctx) => {
    const soapBody = request.body['soap:Envelope']['soap:Body'];
    const method = Object.keys(soapBody)[0];
    const parameters = soapBody[method];
    log.info(`Handling web service POST request for method ${method}`); // NOTE: Good to go since the schema validated the body

    return soapMethodHandlers[method](request, reply, Object.assign({
      method,
      parameters
    }, ctx));
  }; // App setup


  app.eval = async p => {
    const cache = new LRU({
      max: 200,
      ttl: 1000 * 60 * 10,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });
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
        return qs.stringify(params);
      },
      timeout: 90000
    });
    webAPI.interceptors.request.use(request => {
      log.info(`Web API request ${request.method.toUpperCase()} ${request.url}`);
      return request;
    });
    /*
      Helpers for caching and mapping vocabulary.
     */

    const getCached = async (key, ...args) => {
      const data = cache.get(key);
      if (data) return data;
      const resp = await webAPI.get(...args);
      cache.set(key, resp.data);
      return resp.data;
    };

    const getUnitCV = async () => {
      let data = cache.get('unitCV');

      if (!data) {
        const resp = await webAPI.get('/uoms', {
          params: {
            $limit: 2000
          }
        });
        data = {};
        if (resp.data && resp.data.data) resp.data.data.forEach(uom => {
          if (uom.unit_tags && uom.library_config && uom.library_config.wof_web_service) uom.unit_tags.forEach(tag => {
            data[tag] = uom.library_config.wof_web_service;
          });
        });
        cache.set('unitCV', data);
      }

      return data;
    };

    const getVariableCV = async () => {
      let data = cache.get('variableCV');

      if (!data) {
        const resp = await webAPI.get('/vocabularies', {
          params: {
            _id: {
              $in: ['odm-data-type', 'odm-general-category', 'odm-sample-medium', 'odm-value-type', 'odm-variable-name']
            },
            is_enabled: true,
            is_hidden: false
          }
        });
        if (resp.data && resp.data.data) data = resp.data.data.reduce((v, vocabulary) => {
          if (vocabulary.terms) v[vocabulary.label] = vocabulary.terms.reduce((t, term) => {
            if (term.name) t[term.label] = term.name;
            return t;
          }, {});
          return v;
        }, {});
        cache.set('variableCV', data);
      }

      return data;
    };

    const helpers = {
      getCached,
      getUnitCV,
      getVariableCV
    };
    /*
      Set up web service and routes.
     */

    const fastify = require('fastify')();

    fastify.register(require('fastify-cors'), {
      exposedHeaders: ['Accept', 'Content-Type', 'Origin', 'X-Requested-With']
    });
    fastify.register(require('fastify-xml-body-parser')); // Root routes

    fastify.get(`/${SERVICE_1_1}`, {
      prefixTrailingSlash: 'both'
    }, async (request, reply) => {
      return handleGet(request, reply, {
        logger: log,
        p,
        service: SERVICE_1_1
      });
    });
    fastify.post(`/${SERVICE_1_1}`, {
      errorHandler: soapErrorHandler,
      prefixTrailingSlash: 'both',
      schema: SoapRequestSchema
    }, async (request, reply) => {
      return handlePost(request, reply, {
        cache,
        helpers,
        logger: log,
        p,
        service: SERVICE_1_1,
        webAPI
      });
    }); // Org slug routes

    fastify.get(`/:org(${SLUG_REGEXP_STR})/${SERVICE_1_1}`, {
      prefixTrailingSlash: 'both'
    }, async (request, reply) => {
      return handleGet(request, reply, {
        logger: log,
        p,
        service: SERVICE_1_1
      });
    });
    fastify.post(`/:org(${SLUG_REGEXP_STR})/${SERVICE_1_1}`, {
      errorHandler: soapErrorHandler,
      prefixTrailingSlash: 'both',
      schema: SoapRequestSchema
    }, async (request, reply) => {
      return handlePost(request, reply, {
        cache,
        helpers,
        logger: log,
        p,
        service: SERVICE_1_1,
        webAPI
      });
    });
    const address = await fastify.listen(p.port, p.host);
    log.info(`Web service listening on ${address}`);
    app.fastify = fastify;
  };

  app.stop = () => app.fastify && app.fastify.close();

  return app;
};