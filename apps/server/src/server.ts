import { env } from '@repo/env'
import { api } from './app'
import { startDisabledMetersRetry } from './services/start-disabled-meters-retry'
import { startTelemetryCollector } from './services/telemetry-collector'

api
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => {
<<<<<<< HEAD
    if (env.NODE_ENV === 'on') {
=======
    if (env.NODE_ENV !== 'on') {
>>>>>>> 5af8209c3597a75e468e3687b62b10a3684a9ca2
      startTelemetryCollector()
      startDisabledMetersRetry()
    }
  })
  .catch((err) => {
    api.log.error(err)
    process.exit(1)
  })
