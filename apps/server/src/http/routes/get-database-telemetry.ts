import { and, asc, gte, lte, sql } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db/connections'
import { measures } from '@/db/schema/measures'
import {
  type GetDatabase200ResponseDataSchema,
  getDatabase200ResponseSchema,
} from '../types/get-database-200-response'

const telemetryQuerySchema = z.object({
  meterId: z.coerce.number().int().positive().optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  period: z
    .enum([
      'last_5_minutes',
      'last_hour',
      'last_30_minutes',
      'last_6_hours',
      'last_12_hours',
      'last_24_hours',
      'today',
      'last_7_days',
      'this_month',
      'last_30_days',
      'this_year',
    ])
    .optional(),
  aggregation: z
    .enum([
      'raw',
      '30 seconds',
      '1 minute',
      '2 minute',
      '5 minute',
      '10 minute',
      '20 minute',
      '30 minute',
      '1 hour',
      '3 hours',
      '1 day',
    ])
    .default('raw'),
})

type PeriodType = z.infer<typeof telemetryQuerySchema>['period']

interface PeriodDates {
  startDate: Date
  endDate: Date
}

type AggregatedMeasure = Omit<GetDatabase200ResponseDataSchema, 'id'> & {
  time: Date
}

function getPeriodDates(period: PeriodType): PeriodDates {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  switch (period) {
    case 'last_5_minutes':
      return {
        startDate: new Date(now.getTime() - 5 * 60 * 1000),
        endDate: now,
      }
    case 'last_30_minutes':
      return {
        startDate: new Date(now.getTime() - 30 * 60 * 1000),
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
    case 'this_year':
      return {
        startDate: startOfYear,
        endDate: now,
      }
    default:
      throw new Error('Invalid period')
  }
}

function isAggregatedMeasure(data: unknown): data is AggregatedMeasure {
  return (
    typeof data === 'object' &&
    data !== null &&
    'time' in data &&
    'meterId' in data
  )
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
          200: getDatabase200ResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { meterId, startDate, endDate, period, aggregation } = request.query

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

      let data: GetDatabase200ResponseDataSchema[]
      let total: number

      if (aggregation === 'raw') {
        const conditions = [
          gte(measures.time, filterStartDate.toISOString()),
          lte(measures.time, filterEndDate.toISOString()),
        ]

        if (meterId) {
          conditions.push(sql`${measures.meterId} = ${meterId}`)
        }

        // Executa queries em paralelo
        const [rawData, totalResult] = await Promise.all([
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

        data = rawData
        total = totalResult[0]?.count || 0
      } else {
        const meterCondition = meterId ? sql`AND meter_id = ${meterId}` : sql``

        const timeBucketExpression = sql.raw(
          `time_bucket('${aggregation}', time)`
        )

        const aggregatedData = await db.execute<AggregatedMeasure>(sql`
          SELECT
            ${timeBucketExpression} as time,
            meter_id as "meterId",
            -- Médias das tensões
            AVG(tensao_fase_neutro_a) as "tensaoFaseNeutroA",
            AVG(tensao_fase_neutro_b) as "tensaoFaseNeutroB",
            AVG(tensao_fase_neutro_c) as "tensaoFaseNeutroC",
            AVG(tensao_fase_fase_ab) as "tensaoFaseFaseAB",
            AVG(tensao_fase_fase_bc) as "tensaoFaseFaseBC",
            AVG(tensao_fase_fase_ca) as "tensaoFaseFaseCA",
            -- Frequência
            AVG(frequencia) as "frequencia",
            -- Médias das correntes
            AVG(corrente_a) as "correnteA",
            AVG(corrente_b) as "correnteB",
            AVG(corrente_c) as "correnteC",
            AVG(corrente_de_neutro_medido) as "correnteNeutroMedido",
            AVG(corrente_de_neutro_calculado) as "correnteNeutroCalculado",
            -- Potência aparente
            AVG(potencia_aparente_a) as "potenciaAparenteA",
            AVG(potencia_aparente_b) as "potenciaAparenteB",
            AVG(potencia_aparente_c) as "potenciaAparenteC",
            AVG(potencia_aparente_total_soma_aritmetica) as "potenciaAparenteTotalAritmetica",
            AVG(potencia_aparente_total_soma_vetorial) as "potenciaAparenteTotalVetorial",
            -- Potência ativa Fase A
            AVG(potencia_ativa_fundamental_a) as "potenciaAtivaFundamentalA",
            AVG(potencia_ativa_harmonica_a) as "potenciaAtivaHarmonicaA",
            AVG(potencia_ativa_fundamental_harmonica_a) as "potenciaAtivaFundamentalHarmonicaA",
            -- Potência ativa Fase B
            AVG(potencia_ativa_fundamental_b) as "potenciaAtivaFundamentalB",
            AVG(potencia_ativa_harmonica_b) as "potenciaAtivaHarmonicaB",
            AVG(potencia_ativa_fundamental_harmonica_b) as "potenciaAtivaFundamentalHarmonicaB",
            -- Potência ativa Fase C
            AVG(potencia_ativa_fundamental_c) as "potenciaAtivaFundamentalC",
            AVG(potencia_ativa_harmonica_c) as "potenciaAtivaHarmonicaC",
            AVG(potencia_ativa_fundamental_harmonica_c) as "potenciaAtivaFundamentalHarmonicaC",
            -- Potência ativa Total
            AVG(potencia_ativa_fundamental_total) as "potenciaAtivaFundamentalTotal",
            AVG(potencia_ativa_harmonica_total) as "potenciaAtivaHarmonicaTotal",
            AVG(potencia_ativa_fundamental_harmonica_total) as "potenciaAtivaFundamentalHarmonicaTotal",
            -- Potência reativa
            AVG(potencia_reativa_a) as "potenciaReativaA",
            AVG(potencia_reativa_b) as "potenciaReativaB",
            AVG(potencia_reativa_c) as "potenciaReativaC",
            AVG(potencia_reativa_total_soma_aritmetica) as "potenciaReativaTotalAritmetica",
            AVG(potencia_reativa_total_soma_vetorial) as "potenciaReativaTotalVetorial",
            -- Ângulos
            AVG(angulo_fase_a) as "anguloFaseA",
            AVG(angulo_fase_b) as "anguloFaseB",
            AVG(angulo_fase_c) as "anguloFaseC",
            AVG(phi_fase_a) as "phiFaseA",
            AVG(phi_fase_b) as "phiFaseB",
            AVG(phi_fase_c) as "phiFaseC",
            -- Fator de potência
            AVG(fp_real_fase_a) as "fpRealFaseA",
            AVG(fp_real_fase_b) as "fpRealFaseB",
            AVG(fp_real_fase_c) as "fpRealFaseC",
            AVG(fp_real_total_soma_aritmetica) as "fpRealTotalAritmetica",
            AVG(fp_real_total_soma_vetorial) as "fpRealTotalVetorial",
            AVG(fp_deslocamento_fase_a) as "fpDeslocamentoFaseA",
            AVG(fp_deslocamento_fase_b) as "fpDeslocamentoFaseB",
            AVG(fp_deslocamento_fase_c) as "fpDeslocamentoFaseC",
            AVG(fp_deslocamento_total) as "fpDeslocamentoTotal",
            -- THD
            AVG(thd_tensao_a) as "thdTensaoA",
            AVG(thd_tensao_b) as "thdTensaoB",
            AVG(thd_tensao_c) as "thdTensaoC",
            AVG(thd_corrente_a) as "thdCorrenteA",
            AVG(thd_corrente_b) as "thdCorrenteB",
            AVG(thd_corrente_c) as "thdCorrenteC",
            -- Temperatura
            AVG(temperatura_sensor_interno) as "temperaturaSensorInterno"
          FROM measures
          WHERE time >= ${filterStartDate.toISOString()}
            AND time <= ${filterEndDate.toISOString()}
            ${meterCondition}
          GROUP BY ${timeBucketExpression}, meter_id
          ORDER BY ${timeBucketExpression} ASC
        `)

        data = aggregatedData.filter(isAggregatedMeasure).map((row) => ({
          ...row,
          time: new Date(row.time).toISOString(),
        }))

        total = data.length
      }

      const nonNullableKeys: Array<keyof GetDatabase200ResponseDataSchema> = [
        'id',
        'meterId',
        'time',
      ]

      // Calcula registros com todos os dados nulos
      const nullCount = data.filter((row) => {
        return Object.entries(row).every(([key, value]) => {
          return (
            nonNullableKeys.includes(
              key as keyof GetDatabase200ResponseDataSchema
            ) || value === null
          )
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
        aggregation,
      })
    }
  )
}
