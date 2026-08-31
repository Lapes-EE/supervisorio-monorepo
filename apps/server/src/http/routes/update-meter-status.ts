import { db, schema } from "@repo/db"
import { eq } from "drizzle-orm"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import z from "zod"

export const updateMeterStatus: FastifyPluginCallbackZod = (app) => {
  app.patch(
    "/meter/:id",
    {
      schema: {
        summary: "Update meter enabled status",
        security: [{ bearerAuth: [] }],
        tags: ["Meters"],
        params: z.object({
          id: z.coerce.number(),
        }),
        body: z.object({
          enabled: z.boolean(),
        }),
        response: {
          204: z.null().describe("Estado do medidor atualizado"),
          400: z.null().describe("Falha ao atualizar estado do medidor"),
          401: z
            .object({ error: z.string() })
            .describe("Não autorizado, necessita de login"),
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params
      const { enabled } = request.body

      try {
        if (enabled) {
          await db
            .update(schema.meters)
            .set({
              enabled: true,
              health: "healthy",
              failureCount: 0,
              lastFailedAt: null,
            })
            .where(eq(schema.meters.id, id))
        } else {
          await db
            .update(schema.meters)
            .set({
              enabled: false,
            })
            .where(eq(schema.meters.id, id))
        }

        return reply.status(204).send(null)
      } catch {
        return reply.status(400).send(null)
      }
    }
  )
}
