import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '@/db/connections'
import { schema } from '@/db/schema'

export const changeStatusMeters: FastifyPluginCallbackZod = (app) => {
  app.patch(
    '/meter/:id',
    {
      schema: {
        summary: 'Change meter status',
        tags: ['Meters'],
        params: z.object({
          id: z.coerce.number(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      await db
        .update(schema.meters)
        .set({
          active: true,
        })
        .where(eq(schema.meters.id, id))

      return reply.status(204).send()
    }
  )
}
