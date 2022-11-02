/**
 * getVariableInfo handler tests
 */

import * as sinon from 'sinon'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getVariableInfo } from '../../../src/soap/handlers/GetVariableInfo.js'
import { createHelpers } from '../../../src/lib/helpers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Probably should be moved to a utils?
const SERVICE_1_1 = 'cuahsi_1_1'

describe('getVariableInfo handlers', function () {
  afterEach(() => {
    sinon.restore()
  })

  it('should handle getVariableInfo with datastream and no parameters and no umos', async function () {
    const method = 'GetVariableInfo'
    const parameters = {}
    const request = { params: { org: '' } }
    const cache = {}
    const webAPI = {}
    const helpers = createHelpers({ cache, webAPI })
    const ctx = {
      cache,
      helpers,
      service: SERVICE_1_1
    }
    const datastreams = fs.readFileSync(
      path.resolve(__dirname, '../../data/datastreams.json'),
      'utf8'
    )
    const datastreamsData = JSON.parse(datastreams).data

    // For getVariableInfo, we need to fake out
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onFirstCall().returns([{}])
    findManyFake.onSecondCall().returns(datastreamsData)
    findManyFake.onThirdCall().returns([])
    const getUnitCVFake = sinon.fake.returns([])
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getVariableInfo(
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

    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetVariableInfo/responses/datastream-and-no-param-no-uoms.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
  })

  it('should handle getVariableInfo with datastream, uoms and no parameters', async function () {
    const method = 'GetVariableInfo'
    const parameters = {}
    const request = { params: { org: '' } }
    const cache = {}
    const webAPI = {}
    const helpers = createHelpers({ cache, webAPI })
    const ctx = {
      cache,
      helpers,
      service: SERVICE_1_1
    }
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

    // For getVariableInfo, we need to fake out
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onFirstCall().returns([{}])
    findManyFake.onSecondCall().returns(datastreamsData)
    findManyFake.onThirdCall().returns([])
    const getUnitCVFake = sinon.fake.returns(data)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getVariableInfo(
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

    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetVariableInfo/responses/datastream-and-uoms-and-no-params.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
  })

  it('should handle getVariableInfo with datastream, uoms and parameters', async function () {
    const method = 'GetVariableInfo'
    const parameters = {
      variable: ['woftest:VariableCode-full']
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

    // For getVariableInfo, we need to fake out
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onFirstCall().returns([{}])
    findManyFake.onSecondCall().returns([datastreamsData[0]])
    const getUnitCVFake = sinon.fake.returns(data)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getVariableInfo(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)

    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetVariableInfo/responses/datastream-and-param-and-uoms.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
  })

  it('should handle getVariableInfo with datastream, uoms and muiltiple parameters', async function () {
    const method = 'GetVariableInfo'
    const parameters = {
      variable: ['woftest:VariableCode-full', 'woftest:VariableCode-min']
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

    // For getVariableInfo, we need to fake out
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onFirstCall().returns([{}])
    findManyFake.onSecondCall().returns([datastreamsData[1]])
    const getUnitCVFake = sinon.fake.returns(data)
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getVariableInfo(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)
      .concat((await gen.next()).value)

    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetVariableInfo/responses/datastream-and-param-and-uoms.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
  })
})
