import { db, measures } from '@repo/db'
import { desc, eq, sql } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import {
  type GetDatabase200ResponseDataSchema,
  getDatabase200ResponseSchema,
} from '../types/get-database-200-response'
import { availableFields } from '../utils/field-mapping'
import { filterFields, isAggregatedMeasure } from '../utils/field-utils'
import {
  buildAggregatedQuery,
  buildDateFilters,
  fetchRawData,
} from '../utils/telemetry-query-builder'
import { telemetryQuerySchema } from '../utils/telemetry-schema'

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
      const { meterId, startDate, endDate, period, aggregation, fields } =
        request.query

      if (period === 'last_measurement') {
        let lastRows: (typeof measures.$inferSelect)[] = []

        if (meterId) {
          const [row] = await db
            .select()
            .from(measures)
            .where(eq(measures.meterId, meterId))
            .orderBy(desc(measures.time))
            .limit(1)

          if (row) {
            lastRows = [row]
          }
        } else {
          const latestIds = await db.execute<{ id: number }>(sql`
            SELECT DISTINCT ON (meter_id) id
            FROM measures
            ORDER BY meter_id, time DESC
          `)

          if (latestIds.length > 0) {
            const ids = latestIds.map((row) => row.id)
            lastRows = await db
              .select()
              .from(measures)
              .where(
                sql`${measures.id} IN (${sql.join(
                  ids.map((id) => sql`${id}`),
                  sql`, `
                )})`
              )
              .orderBy(desc(measures.time))
          }
        }

        if (lastRows.length === 0) {
          return reply.status(200).send({
            data: [],
            total: 0,
            period: {
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
            },
            nullCount: 0,
            aggregation: 'raw',
          })
        }

        const filteredData = filterFields(lastRows as any, fields)

        const times = lastRows.map((row) => new Date(row.time).toISOString())
        const startDate =
          times.length > 0
            ? times[times.length - 1]
            : new Date().toISOString()
        const endDate =
          times.length > 0 ? times[0] : new Date().toISOString()

        return reply.status(200).send({
          data: filteredData,
          total: lastRows.length,
          period: {
            startDate,
            endDate,
          },
          nullCount: 0,
          aggregation: 'raw',
        })
      }

      const { filterStartDate, filterEndDate } = buildDateFilters({
        period,
        startDate,
        endDate,
      })

      let data: GetDatabase200ResponseDataSchema[]
      let total: number

      if (aggregation === 'raw') {
        const result = await fetchRawData({
          filterStartDate,
          filterEndDate,
          meterId,
        })
        data = result.data
        total = result.total
      } else {
        const aggregatedData = await buildAggregatedQuery({
          filterStartDate,
          filterEndDate,
          meterId,
          aggregation,
          fields: fields && fields.length > 0 ? fields : availableFields,
        })

        data = aggregatedData.filter(isAggregatedMeasure).map((row) => ({
          ...row,
          time: new Date(row.time).toISOString(),
        }))

        total = data.length
      }

      // Filtrar campos na resposta se necessário (somente para raw data)
      const filteredData =
        aggregation === 'raw' ? filterFields(data, fields) : data

      const nonNullableKeys: Array<keyof GetDatabase200ResponseDataSchema> = [
        'id',
        'meterId',
        'time',
      ]

      // Calcula registros com todos os dados nulos
      const nullCount = filteredData.filter((row) => {
        return Object.entries(row).every(([key, value]) => {
          return (
            nonNullableKeys.includes(
              key as keyof GetDatabase200ResponseDataSchema
            ) || value === null
          )
        })
      }).length

      reply.status(200).send({
        data: filteredData,
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
