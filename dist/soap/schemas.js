"use strict";

/*
  Shared types.
 */
const authToken = {
  type: 'string'
};
/*
  {
    "?xml": "",
    "soap:Envelope": {
      "soap:Body": {
        "GetSiteInfoObject": {
          "authToken": "",
          "site": "iutah:LR_WaterLab_AA"
        }
      }
    }
  }
 */

const GetSiteInfoObject = {
  additionalProperties: false,
  properties: {
    GetSiteInfoObject: {
      additionalProperties: false,
      properties: {
        authToken,
        site: {
          type: 'string',
          minLength: 1
        }
      },
      required: ['site'],
      type: 'object'
    }
  },
  required: ['GetSiteInfoObject'],
  type: 'object'
};
const SoapRequestSchema = {
  body: {
    additionalProperties: false,
    properties: {
      'soap:Envelope': {
        additionalProperties: false,
        properties: {
          'soap:Body': {
            oneOf: [GetSiteInfoObject]
          }
        },
        required: ['soap:Body'],
        type: 'object'
      }
    },
    required: ['soap:Envelope'],
    type: 'object'
  }
};
module.exports = {
  SoapRequestSchema
};