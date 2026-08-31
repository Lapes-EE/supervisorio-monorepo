import type { TelemetryItemSchema } from "../types/get-database-200-response"

import type { TelemetryRecord } from "../types/telemetry-record"

export type AggregatedMeasure = {
  time: Date
  meterId: number
} & TelemetryRecord

export function isAggregatedMeasure(data: unknown): data is AggregatedMeasure {
  return (
    typeof data === "object" &&
    data !== null &&
    "time" in data &&
    "meterId" in data
  )
}

export function filterFields(
  data: TelemetryItemSchema[],
  fields?: string[]
): TelemetryItemSchema[] {
  if (!fields || fields.length === 0) {
    return data
  }

  return data.map((row) => {
    if (!row.measurements) {
      return row
    }

    const filteredMeasurements: Record<string, number> = {}

    for (const field of Object.keys(row.measurements)) {
      if (fields.includes(field)) {
        filteredMeasurements[field] = (
          row.measurements as Record<string, number>
        )[field]
      }
    }

    return {
      ...row,
      measurements: filteredMeasurements as typeof row.measurements,
    }
  })
}
