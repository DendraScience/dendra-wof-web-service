/**
 * getSites handler tests
 */

import * as sinon from 'sinon'
import { getSites } from '../../../src/soap/handlers/GetSites.js'
import { createHelpers } from '../../../src/lib/helpers.js'

// Probably should be moved to a utils?
const SERVICE_1_1 = 'cuahsi_1_1.asmx'

describe('GetSites handlers', function () {
  afterEach(() => {
    sinon.restore()
  })

  it('should handle getSites with no station and no parameters', async function () {
    const method = 'GetSites'
    const parameters = {
      site: {
        string: ['', '']
      },
      authToken: ''
    }
    const request = { params: { org: '' } }
    const cache = {}
    const webAPI = {}
    const helpers = createHelpers({ cache, webAPI })
    const ctx = {
      cache,
      helpers,
      service: SERVICE_1_1
    }

    // For getSites, we need to fake out findMany() and orgId()
    const findManyFake = sinon.fake.returns([])
    const orgIdFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'orgId', orgIdFake)

    const date = new Date(1661964219333)
    const gen = getSites(
      request,
      Object.assign({ date, method, parameters }, ctx)
    )

    // Followup with with expect statements to check yielded results
    expect((await gen.next()).value).to.equal(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetSitesResponse xmlns="http://www.cuahsi.org/his/1.1/ws/"><GetSitesResult>&lt;sitesResponse xmlns=&quot;http://www.cuahsi.org/waterML/1.1/&quot;&gt;&lt;queryInfo&gt;&lt;creationTime&gt;2022-08-31T16:43:39.333Z&lt;/creationTime&gt;&lt;criteria MethodCalled=&quot;GetSites&quot;&gt;&lt;/criteria&gt;&lt;/queryInfo&gt;'
    )
    expect((await gen.next()).value).to.equal(
      '&lt;/sitesResponse&gt;</GetSitesResult></GetSitesResponse></soap:Body></soap:Envelope>'
    )
  })

  it('should handle getSites with parameters and no station', async function () {
    const method = 'GetSites'
    const parameters = {
      site: {
        string: ['string1', 'string2']
      },
      authToken: ''
    }
    const request = { params: { org: '' } }
    const cache = {}
    const webAPI = {}
    const helpers = createHelpers({ cache, webAPI })
    const ctx = {
      cache,
      helpers,
      service: SERVICE_1_1
    }

    // For getSites, we need to fake out findMany() and orgId()
    const findManyFake = sinon.fake.returns([])
    const orgIdFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'orgId', orgIdFake)

    const date = new Date(1661964219333)
    const gen = getSites(
      request,
      Object.assign({ date, method, parameters }, ctx)
    )

    // Followup with with expect statements to check yielded results
    expect((await gen.next()).value).to.equal(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetSitesResponse xmlns="http://www.cuahsi.org/his/1.1/ws/"><GetSitesResult>&lt;sitesResponse xmlns=&quot;http://www.cuahsi.org/waterML/1.1/&quot;&gt;&lt;queryInfo&gt;&lt;creationTime&gt;2022-08-31T16:43:39.333Z&lt;/creationTime&gt;&lt;criteria MethodCalled=&quot;GetSites&quot;&gt;&lt;parameter name=&quot;site&quot; value=&quot;string1&quot;/&gt;&lt;parameter name=&quot;site&quot; value=&quot;string2&quot;/&gt;&lt;/criteria&gt;&lt;/queryInfo&gt;'
    )
    expect((await gen.next()).value).to.equal(
      '&lt;/sitesResponse&gt;</GetSitesResult></GetSitesResponse></soap:Body></soap:Envelope>'
    )
  })

  it('should handle getSites with station and no parameters', async function () {
    const method = 'GetSites'
    const parameters = {
      site: {
        string: ['', '']
      },
      authToken: ''
    }
    const request = { params: { org: '' } }
    const cache = {}
    const webAPI = {}
    const helpers = createHelpers({ cache, webAPI })
    const ctx = {
      cache,
      helpers,
      service: SERVICE_1_1
    }

    // For getSites, we need to fake out findMany() and orgId()
    const findManyFake = sinon.fake.returns([
      {
        _id: 'i98573457347593479537495388',
        name: 'Egypt River',
        organization_lookup: { slug: 'IRWA' },
        geo: {
          type: 'Point',
          coordinates: [42.6981327284, -70.8690423578, '4']
        },
        description: 'massachusetts'
      },
      {
        _id: 'i4354457347593479537465668',
        name: 'Fish Brook, Brookview Rd, Boxford',
        organization_lookup: { slug: 'IRWA' },
        geo: {
          type: 'Point',
          coordinates: [42.6584429984, -71.0279778157, '4']
        },
        description: 'massachusetts'
      }
    ])
    const orgIdFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'orgId', orgIdFake)

    const date = new Date(1661964219333)
    const gen = getSites(
      request,
      Object.assign({ date, method, parameters }, ctx)
    )

    // Followup with with expect statements to check yielded results
    expect((await gen.next()).value).to.equal(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetSitesResponse xmlns="http://www.cuahsi.org/his/1.1/ws/"><GetSitesResult>&lt;sitesResponse xmlns=&quot;http://www.cuahsi.org/waterML/1.1/&quot;&gt;&lt;queryInfo&gt;&lt;creationTime&gt;2022-08-31T16:43:39.333Z&lt;/creationTime&gt;&lt;criteria MethodCalled=&quot;GetSites&quot;&gt;&lt;/criteria&gt;&lt;/queryInfo&gt;'
    )
    expect((await gen.next()).value).to.equal(
      '&lt;site&gt;&lt;siteInfo&gt;&lt;siteName&gt;Egypt River&lt;/siteName&gt;&lt;siteCode network=&quot;IRWA&quot;&gt;i98573457347593479537495388&lt;/siteCode&gt;&lt;geoLocation&gt;&lt;geogLocation xsi:type=&quot;LatLonPointType&quot;&gt;&lt;latitude&gt;-70.8690423578&lt;/latitude&gt;&lt;longitude&gt;42.6981327284&lt;/longitude&gt;&lt;/geogLocation&gt;&lt;/geoLocation&gt;&lt;elevation_m&gt;4&lt;/elevation_m&gt;&lt;siteProperty name=&quot;Site Comments&quot;&gt;massachusetts&lt;/siteProperty&gt;&lt;/siteInfo&gt;&lt;/site&gt;'
    )
    expect((await gen.next()).value).to.equal(
      '&lt;site&gt;&lt;siteInfo&gt;&lt;siteName&gt;Fish Brook, Brookview Rd, Boxford&lt;/siteName&gt;&lt;siteCode network=&quot;IRWA&quot;&gt;i4354457347593479537465668&lt;/siteCode&gt;&lt;geoLocation&gt;&lt;geogLocation xsi:type=&quot;LatLonPointType&quot;&gt;&lt;latitude&gt;-71.0279778157&lt;/latitude&gt;&lt;longitude&gt;42.6584429984&lt;/longitude&gt;&lt;/geogLocation&gt;&lt;/geoLocation&gt;&lt;elevation_m&gt;4&lt;/elevation_m&gt;&lt;siteProperty name=&quot;Site Comments&quot;&gt;massachusetts&lt;/siteProperty&gt;&lt;/siteInfo&gt;&lt;/site&gt;'
    )
    expect((await gen.next()).value).to.equal(
      '&lt;/sitesResponse&gt;</GetSitesResult></GetSitesResponse></soap:Body></soap:Envelope>'
    )
  })

  it('should handle getSites with station and parameters', async function () {
    const method = 'GetSites'
    const parameters = {
      site: {
        string: ['string1', '']
      },
      authToken: 'string2'
    }
    const request = { params: { org: '' } }
    const cache = {}
    const webAPI = {}
    const helpers = createHelpers({ cache, webAPI })
    const ctx = {
      cache,
      helpers,
      service: SERVICE_1_1
    }

    // For getSites, we need to fake out findMany() and orgId()
    const findManyFake = sinon.fake.returns([
      {
        _id: 'i98573457347593479537495388',
        name: 'Egypt River',
        organization_lookup: { slug: 'IRWA' },
        geo: {
          type: 'Point',
          coordinates: [42.6981327284, -70.8690423578, '4']
        },
        description: 'massachusetts'
      },
      {
        _id: 'i4354457347593479537465668',
        name: 'Fish Brook, Brookview Rd, Boxford',
        organization_lookup: { slug: 'IRWA' },
        geo: {
          type: 'Point',
          coordinates: [42.6584429984, -71.0279778157, '4']
        },
        description: 'massachusetts'
      }
    ])
    const orgIdFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'orgId', orgIdFake)

    const date = new Date(1661964219333)
    const gen = getSites(
      request,
      Object.assign({ date, method, parameters }, ctx)
    )

    // Followup with with expect statements to check yielded results
    expect((await gen.next()).value).to.equal(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetSitesResponse xmlns="http://www.cuahsi.org/his/1.1/ws/"><GetSitesResult>&lt;sitesResponse xmlns=&quot;http://www.cuahsi.org/waterML/1.1/&quot;&gt;&lt;queryInfo&gt;&lt;creationTime&gt;2022-08-31T16:43:39.333Z&lt;/creationTime&gt;&lt;criteria MethodCalled=&quot;GetSites&quot;&gt;&lt;parameter name=&quot;authToken&quot; value=&quot;string2&quot;/&gt;&lt;parameter name=&quot;site&quot; value=&quot;string1&quot;/&gt;&lt;/criteria&gt;&lt;/queryInfo&gt;'
    )
    expect((await gen.next()).value).to.equal(
      '&lt;site&gt;&lt;siteInfo&gt;&lt;siteName&gt;Egypt River&lt;/siteName&gt;&lt;siteCode network=&quot;IRWA&quot;&gt;i98573457347593479537495388&lt;/siteCode&gt;&lt;geoLocation&gt;&lt;geogLocation xsi:type=&quot;LatLonPointType&quot;&gt;&lt;latitude&gt;-70.8690423578&lt;/latitude&gt;&lt;longitude&gt;42.6981327284&lt;/longitude&gt;&lt;/geogLocation&gt;&lt;/geoLocation&gt;&lt;elevation_m&gt;4&lt;/elevation_m&gt;&lt;siteProperty name=&quot;Site Comments&quot;&gt;massachusetts&lt;/siteProperty&gt;&lt;/siteInfo&gt;&lt;/site&gt;'
    )
    expect((await gen.next()).value).to.equal(
      '&lt;site&gt;&lt;siteInfo&gt;&lt;siteName&gt;Fish Brook, Brookview Rd, Boxford&lt;/siteName&gt;&lt;siteCode network=&quot;IRWA&quot;&gt;i4354457347593479537465668&lt;/siteCode&gt;&lt;geoLocation&gt;&lt;geogLocation xsi:type=&quot;LatLonPointType&quot;&gt;&lt;latitude&gt;-71.0279778157&lt;/latitude&gt;&lt;longitude&gt;42.6584429984&lt;/longitude&gt;&lt;/geogLocation&gt;&lt;/geoLocation&gt;&lt;elevation_m&gt;4&lt;/elevation_m&gt;&lt;siteProperty name=&quot;Site Comments&quot;&gt;massachusetts&lt;/siteProperty&gt;&lt;/siteInfo&gt;&lt;/site&gt;'
    )
    expect((await gen.next()).value).to.equal(
      '&lt;/sitesResponse&gt;</GetSitesResult></GetSitesResponse></soap:Body></soap:Envelope>'
    )
  })
})
