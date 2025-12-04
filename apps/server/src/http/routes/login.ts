import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '@/db/connections'
import { schema } from '@/db/schema'

export const login: FastifyPluginAsyncZod = async (server) => {
  await server.post(
    '/sessions/password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with e-mail & password',
        body: z.object({
          username: z.string(),
          password: z
            .string()
            .min(6, { message: 'Password must be at least 6 characters long' }),
        }),
        response: {
          201: z
            .object({
              token: z.string(),
            })
            .describe('Login realizado, token JWT enviado'),
          400: z.string().describe('Credenciais inválidas'),
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body

      const [user] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.username, username))

      if (!user) {
        reply.status(400).send('Credenciais inválidas')
      }

      const doesPasswordMatch = await verify(user.password, password)

      if (!doesPasswordMatch) {
        reply.status(400).send('Credenciais inválidas')
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '10s',
          },
        }
      )

      return reply.status(201).send({ token })
    }
  )
}
