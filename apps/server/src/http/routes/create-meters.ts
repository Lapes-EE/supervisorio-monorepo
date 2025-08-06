import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { isIP } from 'is-ip'
import z from 'zod/v4'
import { db } from '@/db/connections.ts'
import { schema } from '@/db/schema/index.ts'

export const createMeters: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/meters',
    {
      schema: {
        summary: 'Register a new meter',
        tags: ['Meters'],
        body: z.object({
          name: z.string().min(1, 'Meter name is required'),
          ip: z
            .string()
            .min(1, 'Meter ip is required')
            .refine((val) => isIP(val), {
              error: 'IP inválido',
            }),
          description: z.string().optional(),
        }),
        response: {
          201: z.object({
            createdAt: z.date(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, ip, description } = request.body

      const result = await db
        .insert(schema.meters)
        .values({
          ip,
          name,
          description,
        })
        .returning()

      const insertedRoom = result[0]
      if (!insertedRoom) {
        throw new Error('Failed to create new room')
      }

      return reply.status(201).send({ createdAt: insertedRoom.createdAt })
    }
  )
}
