import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { indices } from '../types/format-telemetry-response'
import {
  type Formatted,
  formattedSchema,
} from '../types/get-telemetry-response'

interface ResponseData {
  sucesso: boolean
  dados: number[][]
}

export const getTelemetryByIp: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/meters/getTelemetry/:ip',
    {
      schema: {
        summary: 'Get raw data from external API',
        tags: ['Telemetry'],
        params: z.object({
          ip: z.string(),
        }),
        response: {
          200: formattedSchema, // Ajuste esse schema se souber o formato exato
        },
      },
    },
    async ({ params }) => {
      const ip = params.ip
      try {
        const url = new URL(`http://${ip}/sys.cgi`)
        url.searchParams.set('readshared', '_MedicaoEnergia')
        url.searchParams.set('type', 'V')

        const data = await fetch(url.toString()).then(
          (res) => res.json() as Promise<ResponseData>
        )

        // Monta objeto com os valores usando os índices
        const formatted = Object.fromEntries(
          Object.entries(indices).map(([key, idx]) => [key, data.dados[1][idx]])
        ) as Formatted

        return formatted
      } catch {
        throw new Error('Erro ao buscar dados na API externa')
      }
    }
  )
}
