import { useQuery } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api'
import { GetTelemetryFieldsAnyOfItem } from '@/http/gen/model/get-telemetry-fields-any-of-item'
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period'
import type { LastMeasurementData } from './data'
import {
  calculateEstimatedVoltage,
  calculateVoltageError,
} from './use-voltage-chart'

export function useLastMeasurements() {
  return useQuery({
    queryKey: ['last-measurements', 'all-voltages'],
    queryFn: async () => {
      const measurementsResponse = await getTelemetry({
        period: GetTelemetryPeriod.last_measurement,
        fields: JSON.stringify([
          GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroA,
          GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroB,
          GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroC,
        ]),
      })

      const meters = await getMeters()
      const measurements = measurementsResponse.data

      const combinedData: LastMeasurementData[] = measurements.map(
        (measurement) => {
          const meter = meters.find((m) => m.id === measurement.meterId)
          const actualC = measurement.measurements?.tensaoFaseNeutroC ?? null
          const estimatedC = calculateEstimatedVoltage(actualC)
          const errorC = calculateVoltageError(actualC, estimatedC)

          return {
            id: measurement.id ?? 0,
            meterId: measurement.meterId,
            name: meter?.name ?? `Medidor ${measurement.meterId}`,
            time: measurement.time,
            tensaoFaseNeutroA:
              measurement.measurements?.tensaoFaseNeutroA ?? null,
            tensaoFaseNeutroB:
              measurement.measurements?.tensaoFaseNeutroB ?? null,
            tensaoFaseNeutroC: actualC,
            estimation: estimatedC,
            error: errorC,
          }
        }
      )

      return combinedData
    },
    refetchInterval: 5000,
    retry: 2,
  })
}
