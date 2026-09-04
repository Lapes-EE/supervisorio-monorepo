import { db, schema } from "@repo/db"
import { asc } from "drizzle-orm"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { isIP } from "is-ip"
import { z } from "zod/v4"

export const getMeters: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/meters",
    {
      schema: {
        summary: "Get all meters",
        tags: ["Meters"],
        response: {
          200: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              ip: z.string().refine((val) => isIP(val), {
                error: "IP inválido",
              }),
              description: z.string().nullish(),
              issoSerial: z.string(),
              enabled: z.boolean(),
              health: z.enum(["healthy", "failing", "cooldown"]).nullish(),
            })
          ),
        },
      },
    },
    async (_, reply) => {
      const result = await db
        .select({
          id: schema.meters.id,
          name: schema.meters.name,
          ip: schema.meters.ip,
          description: schema.meters.description,
          enabled: schema.meters.enabled,
          health: schema.meters.health,
          issoSerial: schema.meters.issoSerial,
        })
        .from(schema.meters)
        .orderBy(asc(schema.meters.name))

      return reply.status(200).send(result)
    }
  )
}
