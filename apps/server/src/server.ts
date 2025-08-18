import { env } from '@repo/env'
import { api } from './app'
import { startTelemetryCollector } from './services/telemetry-collector'

api
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => {
    startTelemetryCollector()
  })
  .catch((err) => {
    api.log.error(err)
    process.exit(1)
  })
