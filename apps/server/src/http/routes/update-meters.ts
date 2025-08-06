import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { isIP } from 'is-ip'
import z from 'zod'
import { db } from '@/db/connections.ts'
import { schema } from '@/db/schema/index.ts'

export const updateMeter: FastifyPluginCallbackZod = (app) => {
  app.put(
    '/meters/:id',
    {
      schema: {
        summary: 'Update an existing meter',
        tags: ['Meters'],
        params: z.object({
          id: z.coerce.number(),
        }),
        body: z.object({
          name: z.string().min(1, 'Meter name is required'),
          ip: z
            .string()
            .min(1, 'Meter IP is required')
            .refine((val) => isIP(val), {
              error: 'IP inválido',
            }),
          description: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { name, ip, description } = request.body

      const result = await db
        .update(schema.meters)
        .set({ name, ip, description })
        .where(eq(schema.meters.id, id))
        .returning()

      const updatedMeter = result[0]
      if (!updatedMeter) {
        return reply.status(404).send({ error: 'Meter not found' })
      }

      return reply.status(201).send()
    }
  )
}
