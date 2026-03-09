import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '@/db/connections'
import { measures } from '@/db/schema/measures'
import type { GetDatabase200ResponseDataSchema } from '../types/get-database-200-response'
import { fieldMapping } from './field-mapping'
import type { AggregatedMeasure } from './field-utils'
import { getPeriodDates } from './period-utils'
import type { PeriodType } from './telemetry-schema'

interface DateFilters {
  filterStartDate: Date
  filterEndDate: Date
}

interface DateFilterInput {
  period?: PeriodType
  startDate?: string
  endDate?: string
}

export function buildDateFilters(input: DateFilterInput): DateFilters {
  const { period, startDate, endDate } = input

  if (period) {
    const periodDates = getPeriodDates(period)
    return {
      filterStartDate: periodDates.startDate,
      filterEndDate: periodDates.endDate,
    }
  }

  if (startDate && endDate) {
    return {
      filterStartDate: new Date(startDate),
      filterEndDate: new Date(endDate),
    }
  }

  // Padrão: últimas 24 horas
  const now = new Date()
  return {
    filterStartDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    filterEndDate: now,
  }
}

interface RawDataInput {
  filterStartDate: Date
  filterEndDate: Date
  meterId?: number
}

interface RawDataResult {
  data: GetDatabase200ResponseDataSchema[]
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
    conditions.push(eq(measures.meterId, meterId))
  }

  const rawData = await db
    .select()
    .from(measures)
    .where(and(...conditions))
    .orderBy(asc(measures.time))

  return {
    data: rawData,
    total: rawData.length,
  }
}

interface AggregatedQueryInput {
  filterStartDate: Date
  filterEndDate: Date
  meterId?: number
  aggregation: string
  fields: readonly string[]
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

  const timeBoundary = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const rawData = await db
    .selectDistinctOn([measures.meterId])
    .from(measures)
    .where(gte(measures.time, timeBoundary))
    .orderBy(measures.meterId, desc(measures.time))

  return {
    data: rawData,
    total: rawData.length,
  }
}
