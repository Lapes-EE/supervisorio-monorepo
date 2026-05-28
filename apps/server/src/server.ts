import { env } from '@repo/env'
import { api } from './app'

api
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => {
    api.log.info('Server is running')
  })
  .catch((err) => {
    api.log.error(err)
    process.exit(1)
  })
