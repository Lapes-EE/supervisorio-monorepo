import { useQuery } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api'
import { GetTelemetryAggregation } from '@/http/gen/model/get-telemetry-aggregation'
import { GetTelemetryFieldsAnyOfItem } from '@/http/gen/model/get-telemetry-fields-any-of-item'
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period'

interface ChartPoint {
  time: string
  [meterName: string]: number | string | null
}

export function useVoltageChartData(meterId?: number) {
  return useQuery({
    queryKey:
      meterId !== undefined
        ? ['voltage-chart', 'fase-c', 'last-5-minutes', meterId]
        : ['voltage-chart', 'fase-c', 'last-5-minutes', 'all'],
    queryFn: async () => {
      const measurementsResponse = await getTelemetry({
        period: GetTelemetryPeriod.last_5_minutes,
        aggregation: GetTelemetryAggregation.raw,
        fields: [GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroC],
        ...(meterId !== undefined ? { meterId } : {}),
      })

      const metersResponse = await getMeters()

      const measurements = measurementsResponse.data.data
      const meters = metersResponse.data

      const meterNames = new Map<number, string>()
      for (const meter of meters) {
        meterNames.set(meter.id, meter.name)
      }

      const timeMap = new Map<string, ChartPoint>()

      for (const measurement of measurements) {
        const time = measurement.time
        const meterName =
          meterNames.get(measurement.meterId) ??
          `Medidor ${measurement.meterId}`

        if (!timeMap.has(time)) {
          timeMap.set(time, { time })
        }

        const point = timeMap.get(time)!
        point[meterName] = measurement.tensaoFaseNeutroC
      }

      return Array.from(timeMap.values()).sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      )
    },
    refetchInterval: 5000,
    retry: 2,
  })
}

export function useMeterNames() {
  return useQuery({
    queryKey: ['meters'],
    queryFn: async () => {
      const response = await getMeters()
      return response.data
    },
    staleTime: 60_000,
  })
}
