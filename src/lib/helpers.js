/**
 * Helpers for caching and mapping vocabulary.
 */

export function createHelpers({ cache, logger, webAPI }) {
  return {
    async findDatapoint(query, last) {
      try {
        const resp = await webAPI.get('/datapoints', {
          params: Object.assign({}, query, {
            $limit: 1,
            $sort: {
              time: last ? -1 : 1
            }
          })
        })
        return (
          resp.data &&
          resp.data.data &&
          resp.data.data.length &&
          resp.data.data[0]
        )
      } catch (err) {
        logger.error(err)
      }
    },

    async findMany(entity, params) {
      const url = `/${entity}`
      const resp = await webAPI.get(url, { params })
      return (resp.data && resp.data.data) || []
    },

    // TODO: Need to fix this
    async findManyCached(entity, params, scope = '') {
      const url = `/${entity}`
      let data = cache.get(scope + url)
      if (!data) {
        const resp = await webAPI.get(url, { params })
        data = (resp.data && resp.data.data) || []
        cache.set(scope + url, data)
      }
      return data
    },

    async findOne(entity, id, params) {
      const url = `/${entity}/${id}`
      const resp = await webAPI.get(url, { params })
      return resp.data && resp.data.data
    },

    // TODO: Need to fix this
    async findOneCached(entity, id, params, scope = '') {
      const url = `/${entity}/${id}`
      let data = cache.get(scope + url)
      if (!data) {
        const resp = await webAPI.get(url, { params })
        data = resp.data
        cache.set(scope + url, data)
      }
      return data
    },

    async getUnitCV() {
      let data = cache.get('unitCV')
      if (!data) {
        const resp = await webAPI.get('/uoms', {
          params: {
            $limit: 2000
          }
        })
        data = {}
        if (resp.data && resp.data.data)
          resp.data.data.forEach(uom => {
            if (
              uom.unit_tags &&
              uom.library_config &&
              uom.library_config.wof_web_service
            )
              uom.unit_tags.forEach(tag => {
                data[tag] = uom.library_config.wof_web_service
              })
          })
        cache.set('unitCV', data)
      }
      return data
    },

    async getVariableCV() {
      let data = cache.get('variableCV')
      if (!data) {
        const resp = await webAPI.get('/vocabularies', {
          params: {
            _id: {
              $in: [
                'odm-data-type',
                'odm-general-category',
                'odm-sample-medium',
                'odm-value-type',
                'odm-variable-name'
              ]
            },
            is_enabled: true,
            is_hidden: false
          }
        })
        if (resp.data && resp.data.data)
          data = resp.data.data.reduce((v, vocabulary) => {
            if (vocabulary.terms)
              v[vocabulary.label] = vocabulary.terms.reduce((t, term) => {
                if (term.name) t[term.label] = term.name
                return t
              }, {})
            return v
          }, {})
        cache.set('variableCV', data)
      }
      return data
    },

    externalRefsMap(extRefs) {
      return extRefs.reduce((map, ref) => {
        map.set(ref.type, ref.identifier)
        return map
      }, new Map())
    },

    // NOTE: Async since we could add slug lookup in the future
    org(org) {
      if (org === 'WOF_ORG') return process.env.WOF_ORG
      return org
    },

    slugify(str, lc = true) {
      return lc
        ? str.replace(/[^A-Za-z0-9]/g, '-').toLowerCase()
        : str.replace(/[^A-Za-z0-9]/g, '-')
    },
    dateformater(str) {
      if (!str) return

      const dateUtc = str ? str + 'Z' : ''
      return new Date(dateUtc).getTime()
    }
  }
}
