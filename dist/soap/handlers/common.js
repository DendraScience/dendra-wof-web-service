"use strict";

const {
  CacheControls,
  ContentTypes,
  Headers
} = require('../../lib/utils');

const {
  soapFault
} = require('../serializers/common');

function soapErrorHandler(error, request, reply) {
  reply.status(500).header(Headers.CACHE_CONTROL, CacheControls.PRIVATE_MAXAGE_0).header(Headers.CONTENT_TYPE, ContentTypes.TEXT_XML_UTF8).send(soapFault(error));
}

module.exports = {
  soapErrorHandler
};