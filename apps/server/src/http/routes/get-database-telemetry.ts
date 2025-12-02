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
