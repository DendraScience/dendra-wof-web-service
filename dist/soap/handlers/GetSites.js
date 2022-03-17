"use strict";

const entities = require('entities');

const {
  Readable
} = require('stream');

const {
  CacheControls,
  ContentTypes,
  Headers
} = require('../../lib/utils');

const {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
} = require('../serializers/query');

const {
  siteStart,
  siteEnd,
  siteInfoStart,
  siteInfoEnd,
  siteInfoType,
  sitesResponseStart,
  sitesResponseEnd
} = require('../serializers/site');

const {
  responseStart,
  soapBodyStart,
  soapBodyEnd,
  soapEnvelopeStart,
  soapEnvelopeEnd
} = require('../serializers/common');

async function* getSites(request, {
  helpers,
  logger,
  method,
  parameters,
  webAPI
}) {
  const {
    site
  } = parameters;
  const sites = site && typeof site === 'object' && typeof site.string === 'string' && site.string > '' ? [site.string] : site && typeof site === 'object' && Array.isArray(site.string) ? site.string : []; // Fetch stations

  const stations = await helpers.findMany('stations', Object.assign({
    is_enabled: true,
    is_hidden: false,
    // TODO: Paginate to allow for more than 2000
    // TODO: Sort!
    $limit: 2000
  }, request.params && request.params.org ? {
    organization_id: request.params.org
  } : undefined, sites.length ? {
    _id: {
      $in: sites.map(str => str.split(':')[1])
    }
  } : undefined));
  yield soapEnvelopeStart() + soapBodyStart() + responseStart('GetSitesResponse') + '<GetSitesResult>' + entities.encodeXML(sitesResponseStart() + queryInfoStart() + queryInfoType({
    method,
    parameters: [['authToken', parameters.authToken], ...sites.map(str => ['site', str])]
  }) + queryInfoEnd());

  for (const station of stations) {
    yield entities.encodeXML(siteStart() + siteInfoStart() + siteInfoType({
      station
    }) + siteInfoEnd() + siteEnd());
  }

  yield entities.encodeXML(sitesResponseEnd()) + '</GetSitesResult>' + '</GetSitesResponse>' + soapBodyEnd() + soapEnvelopeEnd();
}

module.exports = async (request, reply, ctx) => {
  reply.header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0).header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8).send(Readable.from(getSites(request, ctx), {
    autoDestroy: true
  }));
};