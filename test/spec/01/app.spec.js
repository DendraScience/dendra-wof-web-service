/**
 * Main tests
 */

// import * as sinon from 'sinon'
import init from '../../../src/app.js'
import Pino from 'pino'

describe('App', function () {
  const logger = Pino({
    level: 'info'
  })
  let app

  after(async function () {
    if (app) app.stop()
  })

  // afterEach(() => {
  //   sinon.restore()
  // })

  it('should init a new app', async function () {
    app = await init(logger)
    expect(app).to.have.property('start')
    expect(app).to.have.property('stop')
  })

  it('should start app', async function () {
    process.env.PORT = 3000

    await app.start()
    expect(app).to.have.property('fastify')

    const addresses = app.fastify.addresses()

    expect(addresses)
      .to.be.an('array')
      .that.deep.includes({ address: '127.0.0.1', family: 'IPv4', port: 3000 })
  })
})
