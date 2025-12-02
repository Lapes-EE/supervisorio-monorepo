import type {
  FastifyReply,
  FastifyRequest,
  FastifyInstance as FInstance,
} from 'fastify'
import fastifyPlugin from 'fastify-plugin'

export const auth = fastifyPlugin((server: FInstance) => {
  server.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
      } catch {
        reply.code(401).send({ error: 'Token inválido ou ausente' })
      }
    }
  )
})

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>
  }
}
