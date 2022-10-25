/**
 * getSiteInfo handler tests
 */

import * as sinon from 'sinon'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSiteInfo } from '../../../src/soap/handlers/GetSiteInfo.js'
import { createHelpers } from '../../../src/lib/helpers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Probably shpuld be moved to a utils?
const SERVICE_1_1 = 'cuahsi_1_1'

describe('GetSiteInfo handlers', function () {
  afterEach(() => {
    sinon.restore()
  })

  it('should handle getSiteInfo with station, datastreams, params, uoms and variableTimeInterval', async function () {
    const method = 'GetSiteInfo'
    const parameters = {
      site: ['woftest:sitecode-full'],
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

    const datastreams = fs.readFileSync(
      path.resolve(__dirname, '../../data/datastreams.json'),
      'utf8'
    )
    const datastreamsData = JSON.parse(datastreams).data
    const organization = fs.readFileSync(
      path.resolve(__dirname, '../../data/organization.json'),
      'utf8'
    )
    const organizationData = JSON.parse(organization).data
    const variableTimeInterval = {
      firstDatapoint: {
        lt: new Date(1661964219333).toISOString(),
        t: new Date(1661964219333).toISOString()
      },
      lastDatapoint: {
        lt: new Date(1663089496079).toISOString(),
        t: new Date(1663089496079).toISOString()
      }
    }

    // For getSiteInfo, we need to fake out
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onCall(0).returns(organizationData)
    findManyFake.onCall(1).returns([stationData[1]])
    findManyFake.onCall(2).returns([datastreamsData[0], datastreamsData[3]])
    findManyFake.onCall(3).returns([])
    const getUnitCVFake = sinon.fake.returns({})
    const variableTimeIntervalFake = sinon.stub()
    variableTimeIntervalFake
      .onFirstCall()
      .returns(variableTimeInterval.firstDatapoint)
    variableTimeIntervalFake
      .onSecondCall()
      .returns(variableTimeInterval.lastDatapoint)
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)
    sinon.replace(helpers, 'findDatapoint', variableTimeIntervalFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getSiteInfo(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)

    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetSiteInfo/responses/variableTimeInterval.xml'
      ),
      'utf8'
    )
    expect(result).to.equal(response)
  })

  it('should handle getSiteInfo with station, params, uoms and no datastream', async function () {
    const method = 'GetSiteInfo'
    const parameters = {
      site: ['woftest:sitecode-full'],
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

    const uoms = fs.readFileSync(
      path.resolve(__dirname, '../../data/uoms.json'),
      'utf8'
    )
    const uomsData = JSON.parse(uoms).data
    const organization = fs.readFileSync(
      path.resolve(__dirname, '../../data/organization.json'),
      'utf8'
    )
    const organizationData = JSON.parse(organization).data

    // Createing getUnitCV format
    const data = {}
    uomsData.forEach(uom => {
      if (
        uom.unit_tags &&
        uom.library_config &&
        uom.library_config.wof_web_service
      )
        uom.unit_tags.forEach(tag => {
          data[tag] = uom.library_config.wof_web_service
        })
    })

    // For getSiteInfo, we need to fake out
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onFirstCall().returns(organizationData)
    findManyFake.onSecondCall().returns([stationData[1]])
    findManyFake.onThirdCall().returns([])
    const getUnitCVFake = sinon.fake.returns(data)
    const time = sinon.fake.returns([])
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)
    sinon.replace(helpers, 'findDatapoint', time)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getSiteInfo(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)

    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetSiteInfo/responses/station-and-params-and-uoms-and-no-datastream.xml'
      ),
      'utf8'
    )
    expect(result).to.equal(response)
  })

  it('should handle getSiteInfo with station, datastreams, params and uoms', async function () {
    const method = 'GetSiteInfo'
    const parameters = {
      site: ['woftest:sitecode-full'],
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

    const datastreams = fs.readFileSync(
      path.resolve(__dirname, '../../data/datastreams.json'),
      'utf8'
    )
    const datastreamsData = JSON.parse(datastreams).data
    const uoms = fs.readFileSync(
      path.resolve(__dirname, '../../data/uoms.json'),
      'utf8'
    )
    const uomsData = JSON.parse(uoms).data
    const organization = fs.readFileSync(
      path.resolve(__dirname, '../../data/organization.json'),
      'utf8'
    )
    const organizationData = JSON.parse(organization).data

    // Createing getUnitCV format
    const data = {}
    uomsData.forEach(uom => {
      if (
        uom.unit_tags &&
        uom.library_config &&
        uom.library_config.wof_web_service
      )
        uom.unit_tags.forEach(tag => {
          data[tag] = uom.library_config.wof_web_service
        })
    })

    // For getSiteInfo, we need to fake out
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onCall(0).returns(organizationData)
    findManyFake.onCall(1).returns([stationData[1]])
    findManyFake.onCall(2).returns([datastreamsData[0], datastreamsData[3]])
    findManyFake.onCall(3).returns([])
    const getUnitCVFake = sinon.fake.returns(data)
    const time = sinon.fake.returns([])
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)
    sinon.replace(helpers, 'findDatapoint', time)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getSiteInfo(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)

    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetSiteInfo/responses/station-and-datastream-params-and-uoms.xml'
      ),
      'utf8'
    )
    expect(result).to.equal(response)
  })
})
