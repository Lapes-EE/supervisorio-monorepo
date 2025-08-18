// src/http/routes/get-telemetry-by-ip.ts

import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { getTelemetryFromMeter } from '@/services/telemetry-service'
import { formattedSchema } from '../types/get-telemetry-response'

export const getTelemetryByIp: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/meters/getTelemetry/:ip',
    {
      schema: {
        summary: 'Get raw data from external API',
        tags: ['Meters'],
        params: z.object({
          ip: z.string(),
        }),
        response: {
          200: formattedSchema,
        },
      },
    },
    async (request, reply) => {
      const meterIp = request.params.ip
      const telemetry = await getTelemetryFromMeter(meterIp)

      return reply.status(200).send(telemetry)
    }
  )
}
