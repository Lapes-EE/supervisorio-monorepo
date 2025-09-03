import { asc } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { isIP } from 'is-ip'
import { z } from 'zod/v4'
import { db } from '@/db/connections'
import { schema } from '@/db/schema'

export const getMeters: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/meters',
    {
      schema: {
        summary: 'Get all meters',
        tags: ['Meters'],
        response: {
          200: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              ip: z.string().refine((val) => isIP(val), {
                error: 'IP inválido',
              }),
              description: z.string().nullish(),
              active: z.boolean(),
            })
          ),
        },
      },
    },
    async (_, reply) => {
      const result = await db
        .select({
          id: schema.meters.id,
          name: schema.meters.name,
          ip: schema.meters.ip,
          description: schema.meters.description,
          active: schema.meters.active,
        })
        .from(schema.meters)
        .orderBy(asc(schema.meters.name))

      return reply.status(200).send(result)
    }
  )
}
