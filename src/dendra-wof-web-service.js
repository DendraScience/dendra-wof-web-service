#!/usr/bin/env node

/**
 * WaterOneFlow Web Service CLI entry point.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module dendra-wof-web-service
 */

const mri = require('mri')

const log = console

process.on('uncaughtException', err => {
  log.error(`An unexpected error occurred\n  ${err.stack}`)
  process.exit(1)
})

process.on('unhandledRejection', err => {
  if (!err) {
    log.error('An unexpected empty rejection occurred')
  } else if (err instanceof Error) {
    log.error(`An unexpected rejection occurred\n  ${err.stack}`)
  } else {
    log.error(`An unexpected rejection occurred\n  ${err}`)
  }
  process.exit(1)
})

require('./app')(log).then(app => {
  const args = process.argv.slice(2)
  const parsed = mri(args, {
    alias: {
      web_api_url: 'web-api-url'
    },
    default: {
      host: 'localhost',
      port: 3000,
      web_api_url: 'https://api.dendra.science/v2'
    },
    string: ['web_api_url']
  })

  // Handle SIGTERM gracefully for Docker
  // SEE: http://joseoncode.com/2014/07/21/graceful-shutdown-in-node-dot-js/
  process.on('SIGTERM', () => {
    app.stop().then(() => process.exit(0))
  })

  return app.eval(parsed)
})
