import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '@/db/connections.ts'
import { schema } from '@/db/schema/index.ts'
import { auth } from '../utils/middleware.auth'

export const deleteMeter: FastifyPluginCallbackZod = (app) => {
  app.register(auth).delete(
    '/meters/:id',
    {
      schema: {
        summary: 'Delete a meter',
        security: [{ bearerAuth: [] }],
        tags: ['Meters'],
        params: z.object({
          id: z.coerce.number(),
        }),
      },
      preHandler: [
        async (request, reply) => {
          try {
            await app.authenticate(request, reply)
          } catch {
            return reply
              .status(401)
              .send({ error: 'Token inválido ou ausente' })
          }
        },
      ],
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
