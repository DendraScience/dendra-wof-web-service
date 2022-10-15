/**
 * getVariables handler tests
 */

import * as sinon from 'sinon'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getVariables } from '../../../src/soap/handlers/GetVariables.js'
import { createHelpers } from '../../../src/lib/helpers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Probably should be moved to a utils?
const SERVICE_1_1 = 'cuahsi_1_1'

describe('getVariables handlers', function () {
  afterEach(() => {
    sinon.restore()
  })

  it('should handle getVariables with no datastream and no parameters', async function () {
    const method = 'GetVariables'
    const parameters = {
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

    // For getVariables, we need to fake out findMany(), org() and getUnitCVFake()
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onFirstCall().returns([])
    findManyFake.onSecondCall().returns([])
    const getUnitCVFake = sinon.fake.returns([])
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getVariables(
      request,
      Object.assign({ date, method, parameters, uniqueid }, ctx)
    )

    // Followup with with expect statements to check yielded results
    const result = (await gen.next()).value.concat((await gen.next()).value)
    const response = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../data/GetVariables/responses/no-params-and-no-datastreams.xml'
      ),
      'utf8'
    )
    expect(result).to.equal(response)
  })

  it('should handle getVariables with datastream and no parameters', async function () {
    const method = 'GetVariables'
    const parameters = {
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
    const datastreams = fs.readFileSync(
      path.resolve(__dirname, '../../data/datastreams.json'),
      'utf8'
    )
    const datastreamsData = JSON.parse(datastreams).data

    // For getVariables, we need to fake out findMany(), org() and getUnitCVFake()
    const orgFake = sinon.fake.returns('woftest')
    const findManyFake = sinon.stub()
    findManyFake.onFirstCall().returns([])
    findManyFake.onSecondCall().returns(datastreamsData)
    findManyFake.onThirdCall().returns([])
    const getUnitCVFake = sinon.fake.returns([])
    sinon.replace(helpers, 'findMany', findManyFake)
    sinon.replace(helpers, 'org', orgFake)
    sinon.replace(helpers, 'getUnitCV', getUnitCVFake)

    const date = new Date(1661964219333)
    const uniqueid = '1065b42b-0a44-4e53-a146-32bbd580308b'
    const gen = getVariables(
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
        '../../data/GetVariables/responses/datastreams-and-no-params.xml'
      ),
      'utf8'
    )

    expect(result).to.equal(response)
  })
})
