import { and, asc, gte, lte, sql } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db/connections'
import { measures } from '@/db/schema/measures'

const telemetryQuerySchema = z.object({
  meterId: z.coerce.number().int().positive().optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  period: z
    .enum([
      'last_5_minutes',
      'last_hour',
      'last_6_hours',
      'last_12_hours',
      'last_24_hours',
      'today',
      'last_7_days',
      'this_month',
      'last_30_days',
    ])
    .optional(),
})

function getPeriodDates(period: string) {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  switch (period) {
    case 'last_5_minutes':
      return {
        startDate: new Date(now.getTime() - 5 * 60 * 1000),
        endDate: now,
      }
    case 'last_hour':
      return {
        startDate: new Date(now.getTime() - 60 * 60 * 1000),
        endDate: now,
      }
    case 'last_6_hours':
      return {
        startDate: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'last_12_hours':
      return {
        startDate: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'last_24_hours':
      return {
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'today':
      return {
        startDate: startOfDay,
        endDate: now,
      }
    case 'last_7_days':
      return {
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'this_month':
      return {
        startDate: startOfMonth,
        endDate: now,
      }
    case 'last_30_days':
      return {
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: now,
      }
    default:
      throw new Error('Invalid period')
  }
}

export const getDatabaseTelemetry: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/telemetry',
    {
      schema: {
        summary: 'Obtain time telemetry data',
        description: 'Search for measurements with temporal filters',
        tags: ['Telemetry'],
        querystring: telemetryQuerySchema,
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.number(),
                meterId: z.number(),
                time: z.string(),
                // Tensão
                tensaoFaseNeutroA: z.number().nullable(),
                tensaoFaseNeutroB: z.number().nullable(),
                tensaoFaseNeutroC: z.number().nullable(),
                tensaoFaseFaseAB: z.number().nullable(),
                tensaoFaseFaseBC: z.number().nullable(),
                tensaoFaseFaseCA: z.number().nullable(),
                // Frequência
                frequencia: z.number().nullable(),
                // Correntes
                correnteA: z.number().nullable(),
                correnteB: z.number().nullable(),
                correnteC: z.number().nullable(),
                correnteNeutroMedido: z.number().nullable(),
                correnteNeutroCalculado: z.number().nullable(),
                // Potência aparente
                potenciaAparenteA: z.number().nullable(),
                potenciaAparenteB: z.number().nullable(),
                potenciaAparenteC: z.number().nullable(),
                potenciaAparenteTotalAritmetica: z.number().nullable(),
                potenciaAparenteTotalVetorial: z.number().nullable(),
                // Potência ativa - Fase A
                potenciaAtivaFundamentalA: z.number().nullable(),
                potenciaAtivaHarmonicaA: z.number().nullable(),
                potenciaAtivaFundamentalHarmonicaA: z.number().nullable(),
                // Potência ativa - Fase B
                potenciaAtivaFundamentalB: z.number().nullable(),
                potenciaAtivaHarmonicaB: z.number().nullable(),
                potenciaAtivaFundamentalHarmonicaB: z.number().nullable(),
                // Potência ativa - Fase C
                potenciaAtivaFundamentalC: z.number().nullable(),
                potenciaAtivaHarmonicaC: z.number().nullable(),
                potenciaAtivaFundamentalHarmonicaC: z.number().nullable(),
                // Potência ativa - Total
                potenciaAtivaFundamentalTotal: z.number().nullable(),
                potenciaAtivaHarmonicaTotal: z.number().nullable(),
                potenciaAtivaFundamentalHarmonicaTotal: z.number().nullable(),
                // Potência reativa
                potenciaReativaA: z.number().nullable(),
                potenciaReativaB: z.number().nullable(),
                potenciaReativaC: z.number().nullable(),
                potenciaReativaTotalAritmetica: z.number().nullable(),
                potenciaReativaTotalVetorial: z.number().nullable(),
                // Ângulos
                anguloFaseA: z.number().nullable(),
                anguloFaseB: z.number().nullable(),
                anguloFaseC: z.number().nullable(),
                phiFaseA: z.number().nullable(),
                phiFaseB: z.number().nullable(),
                phiFaseC: z.number().nullable(),
                // Fator de potência
                fpRealFaseA: z.number().nullable(),
                fpRealFaseB: z.number().nullable(),
                fpRealFaseC: z.number().nullable(),
                fpRealTotalAritmetica: z.number().nullable(),
                fpRealTotalVetorial: z.number().nullable(),
                fpDeslocamentoFaseA: z.number().nullable(),
                fpDeslocamentoFaseB: z.number().nullable(),
                fpDeslocamentoFaseC: z.number().nullable(),
                fpDeslocamentoTotal: z.number().nullable(),
                // THD
                thdTensaoA: z.number().nullable(),
                thdTensaoB: z.number().nullable(),
                thdTensaoC: z.number().nullable(),
                thdCorrenteA: z.number().nullable(),
                thdCorrenteB: z.number().nullable(),
                thdCorrenteC: z.number().nullable(),
                // Temperatura
                temperaturaSensorInterno: z.number().nullable(),
              })
            ),
            total: z.number(),
            period: z.object({
              startDate: z.string(),
              endDate: z.string(),
            }),
            nullCount: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { meterId, startDate, endDate, period } = request.query

      // Determinar as datas de filtro
      let filterStartDate: Date
      let filterEndDate: Date

      if (period) {
        const periodDates = getPeriodDates(period)
        filterStartDate = periodDates.startDate
        filterEndDate = periodDates.endDate
      } else if (startDate && endDate) {
        filterStartDate = new Date(startDate)
        filterEndDate = new Date(endDate)
      } else {
        // Padrão: últimas 24 horas
        const now = new Date()
        filterStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        filterEndDate = now
      }

      // Construir as condições de filtro
      const conditions = [
        gte(measures.time, filterStartDate.toISOString()),
        lte(measures.time, filterEndDate.toISOString()),
      ]

      if (meterId) {
        conditions.push(sql`${measures.meterId} = ${meterId}`)
      }

      // Buscar todos os dados do período
      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(measures)
          .where(and(...conditions))
          .orderBy(asc(measures.time)),

        db
          .select({ count: sql`count(*)`.mapWith(Number) })
          .from(measures)
          .where(and(...conditions)),
      ])

      const total = totalResult[0]?.count || 0

      const nonNullableKeys = ['id', 'meterId', 'time']

      // Verifica quantos objetos têm todos os campos de dados como null
      const nullCount = data.filter((row) => {
        return Object.entries(row).every(([key, value]) => {
          return nonNullableKeys.includes(key) || value === null
        })
      }).length

      reply.status(200).send({
        data,
        total,
        period: {
          startDate: filterStartDate.toISOString(),
          endDate: filterEndDate.toISOString(),
        },
        nullCount,
      })
    }
  )
}
