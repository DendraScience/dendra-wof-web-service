/**
 * getSitesObject handler tests
 */

import * as sinon from 'sinon'
import { getSitesObject } from '../../../src/soap/handlers/GetSitesObject.js'
import { createHelpers } from '../../../src/lib/helpers.js'

// Probably shpuld be moved to a utils?
const SERVICE_1_1 = 'cuahsi_1_1.asmx'

describe('GetSitesObject handlers', function () {
  afterEach(() => {
    sinon.restore()
  })

  it('should handle getSitesObject with no station and no parameters', async function () {
    const method = 'GetSitesObject'
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

    // For getSitesObject, we need to fake out findMany() and orgId()
    const stations = sinon.fake.returns([])
    const orgIdFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findMany', stations)
    sinon.replace(helpers, 'orgId', orgIdFake)

    const date = new Date(1661964219333)
    const gen = getSitesObject(
      request,
      Object.assign({ method, parameters, date }, ctx)
    )

    // Followup with with expect statements to check yielded results
    expect((await gen.next()).value).to.equal(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetSitesObjectResponse xmlns="http://www.cuahsi.org/his/1.1/ws/"><sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/"><queryInfo><creationTime>2022-08-31T16:43:39.333Z</creationTime><criteria MethodCalled="GetSitesObject"></criteria></queryInfo>'
    )
    expect((await gen.next()).value).to.equal(
      '</sitesResponse></GetSitesObjectResponse></soap:Body></soap:Envelope>'
    )
  })

  it('should handle getSitesObject with parameters and no station', async function () {
    const method = 'GetSitesObject'
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

    // For getSitesObject, we need to fake out findMany() and orgId()
    const stations = sinon.fake.returns([])
    const orgIdFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findMany', stations)
    sinon.replace(helpers, 'orgId', orgIdFake)

    const date = new Date(1661964219333)
    const gen = getSitesObject(
      request,
      Object.assign({ method, parameters, date }, ctx)
    )

    // Followup with with expect statements to check yielded results
    expect((await gen.next()).value).to.equal(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetSitesObjectResponse xmlns="http://www.cuahsi.org/his/1.1/ws/"><sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/"><queryInfo><creationTime>2022-08-31T16:43:39.333Z</creationTime><criteria MethodCalled="GetSitesObject"><parameter name="site" value="string1"/><parameter name="site" value="string2"/></criteria></queryInfo>'
    )
    expect((await gen.next()).value).to.equal(
      '</sitesResponse></GetSitesObjectResponse></soap:Body></soap:Envelope>'
    )
  })

  it('should handle getSitesObject with station with no parameters', async function () {
    const method = 'GetSitesObject'
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

    // For getSitesObject, we need to fake out findMany() and orgId()
    const stations = sinon.fake.returns([
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
    sinon.replace(helpers, 'findMany', stations)
    sinon.replace(helpers, 'orgId', orgIdFake)

    const date = new Date(1661964219333)
    const gen = getSitesObject(
      request,
      Object.assign({ method, parameters, date }, ctx)
    )
    // Followup with with expect statements to check yielded results
    expect((await gen.next()).value).to.equal(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetSitesObjectResponse xmlns="http://www.cuahsi.org/his/1.1/ws/"><sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/"><queryInfo><creationTime>2022-08-31T16:43:39.333Z</creationTime><criteria MethodCalled="GetSitesObject"></criteria></queryInfo>'
    )
    expect((await gen.next()).value).to.equal(
      '<site><siteInfo><siteName>Egypt River</siteName><siteCode network="IRWA">i98573457347593479537495388</siteCode><geoLocation><geogLocation xsi:type="LatLonPointType"><latitude>-70.8690423578</latitude><longitude>42.6981327284</longitude></geogLocation></geoLocation><elevation_m>4</elevation_m><siteProperty name="Site Comments">massachusetts</siteProperty></siteInfo></site>'
    )
    expect((await gen.next()).value).to.equal(
      '<site><siteInfo><siteName>Fish Brook, Brookview Rd, Boxford</siteName><siteCode network="IRWA">i4354457347593479537465668</siteCode><geoLocation><geogLocation xsi:type="LatLonPointType"><latitude>-71.0279778157</latitude><longitude>42.6584429984</longitude></geogLocation></geoLocation><elevation_m>4</elevation_m><siteProperty name="Site Comments">massachusetts</siteProperty></siteInfo></site>'
    )
    expect((await gen.next()).value).to.equal(
      '</sitesResponse></GetSitesObjectResponse></soap:Body></soap:Envelope>'
    )
  })

  it('should handle getSitesObject with station with parameters', async function () {
    const method = 'GetSitesObject'
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

    // For getSitesObject, we need to fake out findMany() and orgId()
    const stations = sinon.fake.returns([
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
    sinon.replace(helpers, 'findMany', stations)
    sinon.replace(helpers, 'orgId', orgIdFake)

    const date = new Date(1661964219333)
    const gen = getSitesObject(
      request,
      Object.assign({ method, parameters, date }, ctx)
    )

    // Followup with with expect statements to check yielded results
    expect((await gen.next()).value).to.equal(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetSitesObjectResponse xmlns="http://www.cuahsi.org/his/1.1/ws/"><sitesResponse xmlns="http://www.cuahsi.org/waterML/1.1/"><queryInfo><creationTime>2022-08-31T16:43:39.333Z</creationTime><criteria MethodCalled="GetSitesObject"><parameter name="site" value="string1"/><parameter name="site" value="string2"/></criteria></queryInfo>'
    )
    expect((await gen.next()).value).to.equal(
      '<site><siteInfo><siteName>Egypt River</siteName><siteCode network="IRWA">i98573457347593479537495388</siteCode><geoLocation><geogLocation xsi:type="LatLonPointType"><latitude>-70.8690423578</latitude><longitude>42.6981327284</longitude></geogLocation></geoLocation><elevation_m>4</elevation_m><siteProperty name="Site Comments">massachusetts</siteProperty></siteInfo></site>'
    )
    expect((await gen.next()).value).to.equal(
      '<site><siteInfo><siteName>Fish Brook, Brookview Rd, Boxford</siteName><siteCode network="IRWA">i4354457347593479537465668</siteCode><geoLocation><geogLocation xsi:type="LatLonPointType"><latitude>-71.0279778157</latitude><longitude>42.6584429984</longitude></geogLocation></geoLocation><elevation_m>4</elevation_m><siteProperty name="Site Comments">massachusetts</siteProperty></siteInfo></site>'
    )
    expect((await gen.next()).value).to.equal(
      '</sitesResponse></GetSitesObjectResponse></soap:Body></soap:Envelope>'
    )
  })
})
