import type { GetDatabase200ResponseDataSchema } from '../types/get-database-200-response'

import type { TelemetryRecord } from '../types/telemetry-record'

export type AggregatedMeasure = Omit<GetDatabase200ResponseDataSchema, 'id'> & {
  time: Date
}

export function isAggregatedMeasure(data: unknown): data is AggregatedMeasure {
  return (
    typeof data === 'object' &&
    data !== null &&
    'time' in data &&
    'meterId' in data
  )
}

export function filterFields<T extends TelemetryRecord>(
  data: T[],
  fields?: string[]
): T[] {
  if (!fields || fields.length === 0) {
    return data
  }

  // Sempre incluir campos obrigatórios
  const requiredFields = ['id', 'meterId', 'time']
  const fieldsToInclude = new Set([...requiredFields, ...fields])

  return data.map((row) => {
    const filtered = {} as T

    for (const [key, value] of Object.entries(row)) {
      if (fieldsToInclude.has(key)) {
        filtered[key as keyof T] = value as T[keyof T]
      }
    }

    return filtered
  })
}
