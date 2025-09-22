import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '@/db/connections'
import { schema } from '@/db/schema'
import { auth } from '../utils/middleware.auth'

export const changeStatusMeters: FastifyPluginCallbackZod = (app) => {
  app.register(auth).patch(
    '/meter/:id',
    {
      schema: {
        summary: 'Change meter status',
        security: [{ bearerAuth: [] }],
        tags: ['Meters'],
        params: z.object({
          id: z.coerce.number(),
        }),
        response: {
          204: z.null().describe('Mudança de estado bem sucedida'),
          400: z.null().describe('Mudança de estado mal sucedida'),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      try {
        await db
          .update(schema.meters)
          .set({
            active: true,
          })
          .where(eq(schema.meters.id, id))

        return reply.status(204).send()
      } catch {
        return reply.status(400).send()
      }
    }
  )
}
