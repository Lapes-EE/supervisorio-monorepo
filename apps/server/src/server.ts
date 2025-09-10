import { env } from '@repo/env'
import { api } from './app'
import { startDisabledMetersRetry } from './services/start-disabled-meters-retry'
import { startTelemetryCollector } from './services/telemetry-collector'

api
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => {
    if (env.NODE_ENV !== 'production') {
      startTelemetryCollector()
      startDisabledMetersRetry()
    }
  })
  .catch((err) => {
    api.log.error(err)
    process.exit(1)
  })
