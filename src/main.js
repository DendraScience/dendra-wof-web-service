/**
 * WaterOneFlow Web Service entry point.
 *
 * @author J. Scott Smith
 * @license BSD-3-Clause
 * @module main
 */

import init from './app.js'
import Pino from 'pino'
import * as dotenv from 'dotenv'
dotenv.config()

const	logger = Pino({
  level: process.env.LOGLEVEL || 'info'
})

process.on('uncaughtException', err => {
  logger.error(`An unexpected error occurred\n  ${err.stack}`)
  process.exit(1)
})

process.on('unhandledRejection', err => {
  if (!err) {
    logger.error('An unexpected empty rejection occurred')
  } else if (err instanceof Error) {
    logger.error(`An unexpected rejection occurred\n  ${err.stack}`)
  } else {
    logger.error(`An unexpected rejection occurred\n  ${err}`)
  }
  process.exit(1)
})

init(logger).then(app => {
  // Handle SIGTERM gracefully for Docker
  // SEE: http://joseoncode.com/2014/07/21/graceful-shutdown-in-node-dot-js/
  process.on('SIGTERM', () => {
    app.stop().then(() => process.exit(0))
  })

			return app.start()
})
