/**
 * getSiteInfoMultpleObject handler tests
 */

import * as sinon from 'sinon'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSiteInfoMultpleObject } from '../../../src/soap/handlers/GetSiteInfoMultpleObject.js'
import { createHelpers } from '../../../src/lib/helpers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Probably shpuld be moved to a utils?
const SERVICE_1_1 = 'cuahsi_1_1'

describe('GetSiteInfoMultpleObject handlers', function () {
  afterEach(() => {
    sinon.restore()
  })

  it('should handle getSiteInfoMultpleObject', async function () {
    const method = 'GetSiteInfoMultpleObject'
    const parameters = {
      site: {
        string: [':sitecode-min', ':sitecode-full']
      }
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
    const organization = fs.readFileSync(
      path.resolve(__dirname, '../../data/organization.json'),
      'utf8'
    )
    const organizationData = JSON.parse(organization).data
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

    // Createing getUnitCV format
    const unitCV = {}
    uomsData.forEach(uom => {
      if (
        uom.unit_tags &&
        uom.library_config &&
        uom.library_config.wof_web_service
      )
        uom.unit_tags.forEach(tag => {
          unitCV[tag] = uom.library_config.wof_web_service
        })
    })

    // For getSiteInfoMultpleObject, we need to fake out  findMany() and org()
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onCall(0).returns(organizationData)
    findManyFake.onCall(1).returns(stationData)
    findManyFake.onCall(2).returns([datastreamsData[0], datastreamsData[3]])
    findManyFake.onCall(3).returns([{ v: 5 }]) // two datapoints needed because of two station
    findManyFake.onCall(4).returns([{ v: 5 }])
    findManyFake.onCall(5).returns([])
    findManyFake.onCall(6).returns([datastreamsData[0], datastreamsData[3]])
    findManyFake.onCall(7).returns([{ v: 5 }]) // two datapoints needed because of two station
    findManyFake.onCall(8).returns([{ v: 5 }])
    findManyFake.onCall(9).returns([])
    findManyFake.onCall(10).returns([])

    const time = sinon.fake.returns([])
    const getUnitCVFake = sinon.fake.returns(unitCV)

    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)
    sinon.replace(helpers, 'findDatapoint', time)
    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getSiteInfoMultpleObject(
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
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)

    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetSiteInfoMultpleObject/responses/multipleStations.xml'
      ),
      'utf8'
    )
    expect(result).to.equal(response)
  })
})
