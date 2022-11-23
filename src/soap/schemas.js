/*
  Shared types.
 */

export const variable = {
  oneOf: [{ type: 'array' }]
}

/*
  GetSiteInfoXXX methods.
 */

export const getSiteInfoType = {
  additionalProperties: false,
  properties: {
    site: {
      oneOf: [{ type: 'array', items: { type: 'string', minLength: 1 } }]
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
    site: {
      oneOf: [
        { type: 'string' },
        {
          properties: {
            string: {
              oneOf: [{ type: 'array' }]
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

export const GetVariables = {
  properties: {
    GetVariables: {}
  },
  required: ['GetVariables'],
  type: 'object'
}

export const GetVariablesObject = {
  properties: {
    GetVariablesObject: {}
  },
  required: ['GetVariablesObject'],
  type: 'object'
}

/*
  GetVariableInfoXXX methods.
 */
export const getVariableInfoType = {
  additionalProperties: false,
  properties: {
    variable
  },
  type: 'object'
}

export const GetVariableInfo = {
  properties: {
    GetVariableInfo: getVariableInfoType
  },
  required: ['GetVariableInfo'],
  type: 'object'
}

export const GetVariableInfoObject = {
  properties: {
    GetVariableInfoObject: getVariableInfoType
  },
  required: ['GetVariableInfoObject'],
  type: 'object'
}

/*
  GetValuesXXX methods.
 */
export const getValuesType = {
  additionalProperties: false,
  properties: {
    location: { type: 'string', minLength: 1 },
    variable: { type: 'string', minLength: 1 },
    startDate: { type: 'string' },
    endDate: { type: 'string' }
  },
  required: ['location', 'variable', 'startDate', 'endDate'],
  type: 'object'
}

export const GetValues = {
  properties: {
    GetValues: getValuesType
  },
  required: ['GetValues'],
  type: 'object'
}

export const GetValuesObject = {
  properties: {
    GetValuesObject: getValuesType
  },
  required: ['GetValuesObject'],
  type: 'object'
}

/*
  GetSiteInfoMultpleObject methods.
 */
export const getSiteInfoMultpleObjectType = {
  additionalProperties: false,
  properties: {
    site: {
      oneOf: [
        { type: 'string' },
        {
          properties: {
            string: {
              oneOf: [
                { type: 'array', items: { type: 'string', minLength: 1 } }
              ]
            }
          },
          type: 'object'
        }
      ]
    }
  },
  required: ['site'],
  type: 'object'
}

export const GetSiteInfoMultpleObject = {
  properties: {
    GetSiteInfoMultpleObject: getSiteInfoMultpleObjectType
  },
  required: ['GetSiteInfoMultpleObject'],
  type: 'object'
}

/*
  GetValuesForASiteObject methods.
 */
export const getValuesForASiteObjectType = {
  additionalProperties: false,
  properties: {
    site: { type: 'string', minLength: 1 },
    startDate: { type: 'string' },
    endDate: { type: 'string' }
  },
  required: ['site'],
  type: 'object'
}

export const GetValuesForASiteObject = {
  properties: {
    GetValuesForASiteObject: getValuesForASiteObjectType
  },
  required: ['GetValuesForASiteObject'],
  type: 'object'
}

/*
  GetSitesByBoxObject methods.
 */
export const getSitesByBoxObjectType = {
  additionalProperties: false,
  properties: {
    west: { type: 'string', minLength: 1 },
    south: { type: 'string', minLength: 1 },
    east: { type: 'string', minLength: 1 },
    north: { type: 'string', minLength: 1 },
    IncludeSeries: { type: 'boolean' }
  },
  required: ['west', 'south', 'east', 'north', 'IncludeSeries'],
  type: 'object'
}

export const GetSitesByBoxObject = {
  properties: {
    GetSitesByBoxObject: getSitesByBoxObjectType
  },
  required: ['GetSitesByBoxObject'],
  type: 'object'
}

/*
  SOAP bleh.
 */

export const SoapRequestSchema = {
  body: {
    additionalProperties: false,
    properties: {
      Envelope: {
        additionalProperties: false,
        properties: {
          Body: {
            oneOf: [
              GetSiteInfo,
              GetSiteInfoObject,
              GetSites,
              GetSitesObject,
              GetVariables,
              GetVariablesObject,
              GetVariableInfo,
              GetVariableInfoObject,
              GetValues,
              GetValuesObject,
              GetSiteInfoMultpleObject,
              GetValuesForASiteObject,
              GetSitesByBoxObject
            ]
          }
        },
        required: ['Body'],
        type: 'object'
      }
    },
    required: ['Envelope'],
    type: 'object'
  }
}
