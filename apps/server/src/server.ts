import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { env } from '@repo/env'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { pino } from 'pino'
import { createMeters } from './http/routes/create-meters'
import { deleteMeter } from './http/routes/delete-meters'
import { getDatabaseTelemetry } from './http/routes/get-database-telemetry'
import { getMeters } from './http/routes/get-meters'
import { getTelemetryByIp } from './http/routes/get-telemetry-by-ip'
import { updateMeter } from './http/routes/update-meters'
import { startTelemetryCollector } from './services/telemetry-collector'

export const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
})

const server = fastify({
  loggerInstance: logger,
}).withTypeProvider<ZodTypeProvider>()

server.register(fastifyCors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
})

server.setSerializerCompiler(serializerCompiler)
server.setValidatorCompiler(validatorCompiler)

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'LAPES - API',
      description: 'API for supervisory control and data acquisition',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

server.get('/health', () => {
  return { status: 'ok' }
})

server.register(createMeters)
server.register(getTelemetryByIp)
server.register(updateMeter)
server.register(getMeters)
server.register(deleteMeter)
server.register(getDatabaseTelemetry)

server.get('/openapi.json', (_, reply) => {
  const spec = server.swagger()
  reply.send(spec)
})

const start = async () => {
  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' })

    startTelemetryCollector()
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
