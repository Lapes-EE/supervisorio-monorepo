import { db, measures } from "@repo/db"
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm"
import { fieldMapping } from "./field-mapping"
import type { AggregatedMeasure } from "./field-utils"
import { getPeriodDates } from "./period-utils"
import type { PeriodType } from "./telemetry-schema"

export interface FlatTelemetryRow {
  id?: number
  meterId: number
  time: string
  [key: string]: unknown
}

interface DateFilters {
  filterEndDate: Date
  filterStartDate: Date
}

interface DateFilterInput {
  endDate?: string
  period?: PeriodType
  startDate?: string
}

export function buildDateFilters(input: DateFilterInput): DateFilters {
  const { period, startDate, endDate } = input

  if (period) {
    const periodDates = getPeriodDates(period)
    return {
      filterEndDate: periodDates.endDate,
      filterStartDate: periodDates.startDate,
    }
  }

  if (startDate && endDate) {
    return {
      filterEndDate: new Date(endDate),
      filterStartDate: new Date(startDate),
    }
  }

  // Padrão: últimas 24 horas
  const now = new Date()
  return {
    filterEndDate: now,
    filterStartDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
  }
}

interface RawDataInput {
  filterEndDate: Date
  filterStartDate: Date
  meterId?: number
}

interface RawDataResult {
  data: FlatTelemetryRow[]
  total: number
}

export async function fetchRawData(
  input: RawDataInput
): Promise<RawDataResult> {
  const { filterStartDate, filterEndDate, meterId } = input

  const conditions = [
    gte(measures.time, filterStartDate.toISOString()),
    lte(measures.time, filterEndDate.toISOString()),
  ]

  if (meterId) {
    conditions.push(sql`${measures.meterId} = ${meterId}`)
  }

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

  return {
    data: rawData,
    total: totalResult[0]?.count || 0,
  }
}

interface AggregatedQueryInput {
  aggregation: string
  fields: readonly string[]
  filterEndDate: Date
  filterStartDate: Date
  meterId?: number
}

export async function buildAggregatedQuery(
  input: AggregatedQueryInput
): Promise<AggregatedMeasure[]> {
  const { filterStartDate, filterEndDate, meterId, aggregation, fields } = input

  const meterCondition = meterId ? sql`AND meter_id = ${meterId}` : sql``
  const timeBucketExpression = sql.raw(`time_bucket('${aggregation}', time)`)

  // Construir SELECT dinâmico apenas com os campos solicitados
  const selectClauses = fields.map((field) => {
    const dbField = fieldMapping[field]
    return sql.raw(`AVG(${dbField}) as "${field}"`)
  })

  const aggregatedData = await db.execute<AggregatedMeasure>(sql`
    SELECT
      ${timeBucketExpression} as time,
      meter_id as "meterId"
      ${selectClauses.length > 0 ? sql`, ${sql.join(selectClauses, sql`, `)}` : sql``}
    FROM measures
    WHERE time >= ${filterStartDate.toISOString()}
      AND time <= ${filterEndDate.toISOString()}
      ${meterCondition}
    GROUP BY ${timeBucketExpression}, meter_id
    ORDER BY ${timeBucketExpression} ASC
  `)

  return aggregatedData
}

interface LastMeasurementInput {
  meterId?: number
}

export async function fetchLastMeasurement(
  input: LastMeasurementInput
): Promise<RawDataResult> {
  const { meterId } = input

  if (meterId) {
    const rawDataWithId = await db
      .select()
      .from(measures)
      .where(eq(measures.meterId, meterId))
      .orderBy(desc(measures.time))
      .limit(1)

    return {
      data: rawDataWithId,
      total: rawDataWithId.length,
    }
  }

  const columnAliases = Object.entries(fieldMapping).map(
    ([camelCase, snakeCase]) => sql.raw(`${snakeCase} as "${camelCase}"`)
  )

  const rawData = await db.execute<FlatTelemetryRow>(sql`
    SELECT DISTINCT ON (meter_id)
      id,
      meter_id as "meterId",
      time,
      ${sql.join(columnAliases, sql`, `)}
    FROM measures
    WHERE time > NOW() - INTERVAL '5 minutes'
    ORDER BY meter_id, time DESC
  `)

  return {
    data: rawData,
    total: rawData.length,
  }
}

export const telemetryQueryBuilder = {
  buildAggregatedQuery,
  buildDateFilters,
  fetchLastMeasurement,
  fetchRawData,
}
