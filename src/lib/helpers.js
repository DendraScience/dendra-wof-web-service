/**
 * Helpers for caching and mapping vocabulary.
 */

export function createHelpers({ cache, webAPI }) {
  return {
    async findDatapoint(query, last) {
      const resp = await webAPI.get('/datapoints', {
        params: Object.assign({}, query, {
          $limit: 1,
          $sort: {
            time: last ? -1 : 1
          }
        })
      })
      try {
        return (
          resp.data &&
          resp.data.data &&
          resp.data.data.length &&
          resp.data.data[0]
        )
      } catch (err) {}
    },

    async findMany(entity, params) {
      const url = `/${entity}`
      const resp = await webAPI.get(url, { params })
      return (resp.data && resp.data.data) || []
    },

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
      return resp.data
    },

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

    externalRefs(extRefs) {
      const obj = {}
      extRefs.forEach(ref => {
        if (ref.type === 'his.odm.sites.SiteID') {
          obj.siteId = ref.identifier
        } else if (ref.type === 'his.odm.sites.SiteCode') {
          obj.siteCode = ref.identifier
        } else if (ref.type === 'his.odm.sites.VerticalDatum') {
          obj.verticalDatum = ref.identifier
        } else if (ref.type === 'his.odm.sites.LocalX') {
          obj.localX = ref.identifier
        } else if (ref.type === 'his.odm.sites.LocalY') {
          obj.localY = ref.identifier
        } else if (ref.type === 'his.odm.sites.PosAccuracy_m') {
          obj.posAccuracy_m = ref.identifier
        } else if (ref.type === 'his.odm.sites.State') {
          obj.state = ref.identifier
        } else if (ref.type === 'his.odm.sites.County') {
          obj.county = ref.identifier
        } else if (ref.type === 'his.odm.sites.Comments') {
          obj.comments = ref.identifier
        } else if (ref.type === 'his.odm.sites.Elevation_m') {
          obj.elevation_m = ref.identifier
        }
      })
      return obj
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

    safeName(str, lc = true) {
      return lc
        ? str.replace(/\W/g, '-').toLowerCase()
        : str.replace(/\W/g, '-')
    }
  }
}
