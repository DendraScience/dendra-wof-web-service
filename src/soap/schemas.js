/*
  Shared types.
 */
const authToken = {
  type: 'string'
}

/*
  GetSiteInfoXXX methods.
 */

const getSiteInfoType = {
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

const GetSiteInfo = {
  properties: {
    GetSiteInfo: getSiteInfoType
  },
  required: ['GetSiteInfo'],
  type: 'object'
}

const GetSiteInfoObject = {
  properties: {
    GetSiteInfoObject: getSiteInfoType
  },
  required: ['GetSiteInfoObject'],
  type: 'object'
}

/*
  GetSitesXXX methods.
 */

const getSitesType = {
  additionalProperties: false,
  properties: {
    authToken,
    site: {
      oneOf: [
        { type: 'string' },
        {
          properties: {
            string: {
              oneOf: [
                { type: 'string' },
                {
                  items: {
                    type: 'string'
                  },
                  type: 'array'
                }
              ]
            }
          },
          type: 'object'
        }
      ]
    }
  },
  type: 'object'
}

const GetSites = {
  properties: {
    GetSites: getSitesType
  },
  required: ['GetSites'],
  type: 'object'
}

const GetSitesObject = {
  properties: {
    GetSitesObject: getSitesType
  },
  required: ['GetSitesObject'],
  type: 'object'
}

/*
  SOAP bleh.
 */

const SoapRequestSchema = {
  body: {
    additionalProperties: false,
    properties: {
      'soap:Envelope': {
        additionalProperties: false,
        properties: {
          'soap:Body': {
            oneOf: [GetSiteInfo, GetSiteInfoObject, GetSites, GetSitesObject]
          }
        },
        required: ['soap:Body'],
        type: 'object'
      }
    },
    required: ['soap:Envelope'],
    type: 'object'
  }
}

module.exports = {
  SoapRequestSchema
}
