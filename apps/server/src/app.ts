import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySSE from '@fastify/sse'
import fastifySwagger from '@fastify/swagger'
import { env } from '@repo/env'
import fastifyApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createMeters } from './http/routes/create-meters'
import { deleteMeter } from './http/routes/delete-meters'
import { getDatabaseTelemetry } from './http/routes/get-database-telemetry'
import { getMeters } from './http/routes/get-meters'
import { login } from './http/routes/login'
import { sseTelemetry } from './http/routes/sse-telemetry'
import { updateMeterStatus } from './http/routes/update-meter-status'
import { updateMeter } from './http/routes/update-meters'
import { auth } from './http/utils/middleware.auth'

const api = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>()

api.register(fastifyCors, {
  origin: [env.WEB_URL, 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})
api.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})
api.register(fastifySSE, {
  heartbeatInterval: 30_000,
})

api.setSerializerCompiler(serializerCompiler)
api.setValidatorCompiler(validatorCompiler)

api.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'LAPES - API',
      description: 'API for supervisory control and data acquisition',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

api.register(fastifyApiReference, {
  routePrefix: '/docs',
  configuration: {
    theme: 'deepSpace',
  },
})

api.get('/health', () => {
  return { status: 'ok' }
})

api.register(login) // Ensure login route is registered early for authentication
api.register(auth) // Register auth plugin globally

api.register(createMeters)
api.register(updateMeterStatus)
api.register(updateMeter)
api.register(getMeters)
api.register(deleteMeter)
api.register(getDatabaseTelemetry)
api.register(sseTelemetry)

api.get('/openapi.json', (_, reply) => {
  const spec = api.swagger()
  reply.send(spec)
})

export { api }
