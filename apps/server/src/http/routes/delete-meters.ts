import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '@/db/connections.ts'
import { schema } from '@/db/schema/index.ts'

export const deleteMeter: FastifyPluginCallbackZod = (app) => {
  app.delete(
    '/meters/:id',
    {
      schema: {
        summary: 'Delete a meter',
        tags: ['Telemetry'],
        params: z.object({
          id: z.coerce.number(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const result = await db
        .delete(schema.meters)
        .where(eq(schema.meters.id, id))
        .returning()

      const deletedMeter = result[0]
      if (!deletedMeter) {
        return reply.status(404).send({ error: 'Meter not found' })
      }

      return reply.status(204).send()
    }
  )
}
