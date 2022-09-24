/*
  Shared types.
 */

export const authToken = {
  type: 'string'
}

/*
  GetSiteInfoXXX methods.
 */

export const getSiteInfoType = {
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

export const GetSiteInfo = {
  properties: {
    GetSiteInfo: getSiteInfoType
  },
  required: ['GetSiteInfo'],
  type: 'object'
}

export const GetSiteInfoObject = {
  properties: {
    GetSiteInfoObject: getSiteInfoType
  },
  required: ['GetSiteInfoObject'],
  type: 'object'
}

/*
  GetSitesXXX methods.
 */

export const getSitesType = {
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

export const GetSites = {
  properties: {
    GetSites: getSitesType
  },
  required: ['GetSites'],
  type: 'object'
}

export const GetSitesObject = {
  properties: {
    GetSitesObject: getSitesType
  },
  required: ['GetSitesObject'],
  type: 'object'
}

/*
  GetVariablesXXX methods.
 */
export const getVariablesType = {
  additionalProperties: false,
  properties: {
    authToken
  },
  type: 'object'
}

export const GetVariablesObject = {
  properties: {
    GetVariablesObject: getVariablesType
  },
  required: ['GetVariablesObject'],
  type: 'object'
}

/*
  SOAP bleh.
 */

export const SoapRequestSchema = {
  body: {
    additionalProperties: false,
    properties: {
      'soap:Envelope': {
        additionalProperties: false,
        properties: {
          'soap:Body': {
            oneOf: [
              GetSiteInfo,
              GetSiteInfoObject,
              GetSites,
              GetSitesObject,
              GetVariablesObject
            ]
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
