import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
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
import { pino } from 'pino'
import { changeStatusMeters } from './http/routes/change-meter-status'
import { createMeters } from './http/routes/create-meters'
import { deleteMeter } from './http/routes/delete-meters'
import { getDatabaseTelemetry } from './http/routes/get-database-telemetry'
import { getMeters } from './http/routes/get-meters'
import { getTelemetryByIp } from './http/routes/get-telemetry-by-ip'
import { login } from './http/routes/login'
import { updateMeter } from './http/routes/update-meters'

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
})

const api = fastify({
  logger:
    process.env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : false,
}).withTypeProvider<ZodTypeProvider>()

api.register(fastifyCors, {
  origin: ['http://localhost:3000', 'https://lapes.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})
api.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

api.setSerializerCompiler(serializerCompiler)
api.setValidatorCompiler(validatorCompiler)

if (env.NODE_ENV === 'development') {
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
}

api.get('/health', () => {
  return { status: 'ok' }
})

api.register(changeStatusMeters)
api.register(createMeters)
api.register(getTelemetryByIp)
api.register(updateMeter)
api.register(getMeters)
api.register(deleteMeter)
api.register(getDatabaseTelemetry)
api.register(login)

api.get('/openapi.json', (_, reply) => {
  const spec = api.swagger()
  reply.send(spec)
})

export { api }
