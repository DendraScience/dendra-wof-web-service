/**
 * getSites handler tests
 */

import * as sinon from 'sinon'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSites } from '../../../src/soap/handlers/GetSites.js'
import { createHelpers } from '../../../src/lib/helpers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Probably should be moved to a utils?
const SERVICE_1_1 = 'cuahsi_1_1'

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

    // For getSites, we need to fake out findOneCached(), findMany() and org()
    const organizationFake = sinon.fake.returns({})
    const findManyFake = sinon.fake.returns([])
    const orgFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findOneCached', organizationFake)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'org', orgFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getSites(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value.concat((await gen.next()).value)
    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetSites/responses/no-params-and-no-stations.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
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

    // For getSites, we need to fake out findOneCached(), findMany() and org()
    const organizationFake = sinon.fake.returns({})
    const findManyFake = sinon.fake.returns([])
    const orgFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findOneCached', organizationFake)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'org', orgFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getSites(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value.concat((await gen.next()).value)
    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetSites/responses/params-and-no-stations.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
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

    const stations = fs.readFileSync(
      path.resolve(__dirname, '../../data/stations.json'),
      'utf8'
    )
    const stationData = JSON.parse(stations).data

    // For getSites, we need to fake out findOneCached(), findMany() and org()
    const organizationFake = sinon.fake.returns({})
    const stationsFake = sinon.stub()
    stationsFake.onFirstCall().returns(stationData)
    stationsFake.onSecondCall().returns([])
    const orgFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findOneCached', organizationFake)
    sinon.replace(helpers, 'findMany', stationsFake)
    sinon.replace(helpers, 'org', orgFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getSites(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetSites/responses/stations-and-no-params.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
  })

  it('should handle getSites with station and parameters', async function () {
    const method = 'GetSites'
    const parameters = {
      site: {
        string: ['woftest:sitecode-min', 'woftest:sitecode-full']
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

    const stations = fs.readFileSync(
      path.resolve(__dirname, '../../data/stations.json'),
      'utf8'
    )
    const stationData = JSON.parse(stations).data

    // For getSites, we need to fake out findOneCached(), findMany() and org()
    const organizationFake = sinon.fake.returns({})
    const stationsFake = sinon.stub()
    stationsFake.onFirstCall().returns(stationData)
    stationsFake.onSecondCall().returns([])
    const orgFake = sinon.fake.returns('')
    sinon.replace(helpers, 'findOneCached', organizationFake)
    sinon.replace(helpers, 'findMany', stationsFake)
    sinon.replace(helpers, 'org', orgFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getSites(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetSites/responses/stations-and-params.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
  })
})
