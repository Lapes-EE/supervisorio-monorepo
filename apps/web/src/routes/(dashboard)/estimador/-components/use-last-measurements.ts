import { useQuery } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api'
import { GetTelemetryFieldsAnyOfItem } from '@/http/gen/model/get-telemetry-fields-any-of-item'
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period'
import type { LastMeasurementData } from './data'

export function useLastMeasurements() {
  return useQuery({
    queryKey: ['last-measurements', 'all-voltages'],
    queryFn: async () => {
      const measurementsResponse = await getTelemetry({
        period: GetTelemetryPeriod.last_measurement,
        fields: [
          GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroA,
          GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroB,
          GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroC,
        ],
      })

      const metersResponse = await getMeters()

      const measurements = measurementsResponse.data.data
      const meters = metersResponse.data

      const combinedData: LastMeasurementData[] = measurements.map(
        (measurement) => {
          const meter = meters.find((m) => m.id === measurement.meterId)
          return {
            id: measurement.id ?? 0,
            meterId: measurement.meterId,
            name: meter?.name ?? `Medidor ${measurement.meterId}`,
            time: measurement.time,
            tensaoFaseNeutroA: measurement.tensaoFaseNeutroA,
            tensaoFaseNeutroB: measurement.tensaoFaseNeutroB,
            tensaoFaseNeutroC: measurement.tensaoFaseNeutroC,
            estimation: '---',
          }
        }
      )

      return combinedData
    },
    refetchInterval: 5000,
    retry: 2,
  })
}
