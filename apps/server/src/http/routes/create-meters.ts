import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { isIP } from 'is-ip'
import z from 'zod/v4'
import { db } from '@/db/connections.ts'
import { schema } from '@/db/schema/index.ts'
import { auth } from '../utils/middleware.auth'

const ISSO_SERIAL_REGEX = /^[A-Z0-9]{3}(?:-[A-Z0-9]{3}){3}$/

export const createMeters: FastifyPluginCallbackZod = (app) => {
  app.register(auth).post(
    '/meters',
    {
      schema: {
        summary: 'Register a new meter',
        security: [{ bearerAuth: [] }],
        tags: ['Meters'],
        body: z.object({
          name: z.string().min(1, 'Meter name is required'),
          ip: z
            .string()
            .min(1, 'Meter ip is required')
            .refine((val) => isIP(val), {
              error: 'IP inválido',
            }),
          issoSerial: z
            .string()
            .min(1, 'Serial is required')
            .refine((val) => ISSO_SERIAL_REGEX.test(val), {
              message: 'Serial inválido. Formato esperado: 258-A17-39C-D6A',
            }),
          description: z.string().optional(),
        }),
        response: {
          201: z
            .object({
              createdAt: z.date(),
            })
            .describe('Criação de medidor bem sucedida'),
          401: z
            .object({
              error: z.string(),
            })
            .describe('Não autorizado, necessita de login'),
        },
      },
      preHandler: [
        async (request, reply) => {
          try {
            await request.jwtVerify()
          } catch {
            return reply
              .status(401)
              .send({ error: 'Token inválido ou ausente' })
          }
        },
      ],
    },
    async (request, reply) => {
      const { name, ip, description, issoSerial } = request.body

      const result = await db
        .insert(schema.meters)
        .values({
          ip,
          issoSerial,
          name,
          description,
        })
        .returning()

      const insertedRoom = result[0]

      return reply.status(201).send({ createdAt: insertedRoom.createdAt })
    }
  )
}
