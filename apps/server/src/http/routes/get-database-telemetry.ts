import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import {
  getDatabase200ResponseSchema,
  type TelemetryItemSchema,
  type TelemetryMeasurementsSchema,
} from '../types/get-database-200-response'
import { availableFields } from '../utils/field-mapping'
import { filterFields, isAggregatedMeasure } from '../utils/field-utils'
import {
  buildAggregatedQuery,
  buildDateFilters,
  fetchLastMeasurement,
  fetchRawData,
} from '../utils/telemetry-query-builder'
import { telemetryQuerySchema } from '../utils/telemetry-schema'

function normalizeTime(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }
  return String(value)
}

function transformToNested(
  flatRow: Record<string, unknown>
): TelemetryItemSchema {
  const measurements = {} as TelemetryMeasurementsSchema

  for (const field of availableFields) {
    const value = flatRow[field]
    ;(measurements as Record<string, number>)[field] =
      value !== undefined && value !== null ? Number(value) : 0
  }

  const allMeasurementsNull = availableFields.every(
    (field) => flatRow[field] === null || flatRow[field] === undefined
  )

  return {
    id: flatRow.id !== undefined ? Number(flatRow.id) : undefined,
    meterId: Number(flatRow.meterId),
    time: normalizeTime(flatRow.time),
    status: allMeasurementsNull ? 'error' : 'success',
    message: allMeasurementsNull
      ? 'Timeout na comunicação com o medidor'
      : null,
    measurements: allMeasurementsNull ? null : measurements,
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

      let flatData: Record<string, unknown>[]
      let total: number

      if (period === 'last_measurement') {
        const result = await fetchLastMeasurement({ meterId })
        flatData = result.data
        total = result.total
      } else if (aggregation === 'raw') {
        const result = await fetchRawData({
          filterStartDate,
          filterEndDate,
          meterId,
        })
        flatData = result.data
        total = result.total
      } else {
        const aggregatedData = await buildAggregatedQuery({
          filterStartDate,
          filterEndDate,
          meterId,
          aggregation,
          fields: fields && fields.length > 0 ? fields : availableFields,
        })

        flatData = aggregatedData.filter(isAggregatedMeasure).map((row) => ({
          ...row,
          time: new Date(row.time).toISOString(),
        }))

        total = flatData.length
      }

      const nestedData = flatData.map(transformToNested)

      const filteredData =
        aggregation === 'raw' || period === 'last_measurement'
          ? filterFields(nestedData, fields)
          : nestedData

      const nullCount = filteredData.filter(
        (row) => row.status === 'error'
      ).length

      reply.status(200).send({
        data: filteredData,
        total,
        period: {
          startDate:
            filteredData.length > 0
              ? filteredData[0].time
              : filterStartDate.toISOString(),
          endDate:
            filteredData.length > 0
              ? (filteredData.at(-1)?.time ?? filterEndDate.toISOString())
              : filterEndDate.toISOString(),
        },
        nullCount,
        aggregation: period === 'last_measurement' ? 'raw' : aggregation,
      })
    }
  )
}
