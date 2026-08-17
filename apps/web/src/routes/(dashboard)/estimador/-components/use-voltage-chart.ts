import { useQuery } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api'
import { GetTelemetryAggregation } from '@/http/gen/model/get-telemetry-aggregation'
import { GetTelemetryFieldsAnyOfItem } from '@/http/gen/model/get-telemetry-fields-any-of-item'
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period'

export interface EstimatorBarChartPoint {
  label: string
  time: string
  actual: number | null
  estimated: number | null
  error: number | null
}

export function calculateEstimatedVoltage(
  actual: number | null
): number | null {
  if (actual === null || actual === undefined) {
    return null
  }
  return 214.0
}

export function calculateVoltageError(
  actual: number | null,
  estimated: number | null
): number | null {
  if (actual === null || estimated === null) {
    return null
  }
  return Number((actual - estimated).toFixed(2))
}

export function buildFiveMinuteBuckets(
  measurements: Array<{
    time: string
    meterId: number
    measurements?: { tensaoFaseNeutroC?: number | null } | null
  }>,
  referenceDate: Date = new Date()
): EstimatorBarChartPoint[] {
  const currentMinuteMs = Math.floor(referenceDate.getTime() / 60_000) * 60_000

  const buckets: EstimatorBarChartPoint[] = []

  for (let i = 4; i >= 0; i--) {
    const bucketStartMs = currentMinuteMs - i * 60_000
    const bucketEndMs = bucketStartMs + 60_000
    const bucketDate = new Date(bucketStartMs)

    const label = bucketDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const itemsInBucket = measurements.filter((m) => {
      const itemTimeMs = new Date(m.time).getTime()
      return itemTimeMs >= bucketStartMs && itemTimeMs < bucketEndMs
    })

    const validVoltages = itemsInBucket
      .map((m) => m.measurements?.tensaoFaseNeutroC)
      .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))

    let actual: number | null = null
    if (validVoltages.length > 0) {
      const sum = validVoltages.reduce((acc, val) => acc + val, 0)
      actual = Number((sum / validVoltages.length).toFixed(1))
    }

    const estimated = calculateEstimatedVoltage(actual)
    const error = calculateVoltageError(actual, estimated)

    buckets.push({
      label,
      time: bucketDate.toISOString(),
      actual,
      estimated,
      error,
    })
  }

  return buckets
}

export function useVoltageChartData(meterId?: number) {
  return useQuery({
    queryKey: ['voltage-chart', 'fase-c', '5-minutes-1-min-bars', meterId],
    queryFn: async () => {
      if (meterId === undefined) {
        return []
      }

      const measurementsResponse = await getTelemetry({
        period: GetTelemetryPeriod.last_5_minutes,
        aggregation: GetTelemetryAggregation.raw,
        fields: JSON.stringify([GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroC]),
        meterId,
      })

      const measurements = measurementsResponse.data
      return buildFiveMinuteBuckets(measurements)
    },
    enabled: meterId !== undefined,
    refetchInterval: 5000,
    retry: 2,
  })
}

export function useMeterNames() {
  return useQuery({
    queryKey: ['meters'],
    queryFn: async () => {
      return await getMeters()
    },
    staleTime: 60_000,
  })
}
