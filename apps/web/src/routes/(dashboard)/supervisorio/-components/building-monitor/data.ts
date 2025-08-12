import { useQueries, useQuery } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api.gen'
import type {
  GetTelemetry200,
  GetTelemetry200DataItem,
  GetTelemetryPeriod,
} from '@/http/gen/model'
import { dayjs } from '@/lib/dayjs'
import type { ToggleSearchSchema } from '../..'
import type { Meter, Sensor } from './types'

const fixedPositions: Array<{ x: number; y: number }> = [
  // Primeiro andar
  { x: 75, y: 90 },
  { x: 20, y: 90 },
  { x: 50, y: 90 },

  // Segundo andar
  { x: 20, y: 60 },
  { x: 50, y: 60 },
  { x: 75, y: 60 },

  // Terceiro andar
  { x: 50, y: 25 },
  { x: 75, y: 25 },
  { x: 20, y: 25 },

  // Auditório
  { x: 85, y: 45 },
  { x: 95, y: 45 },

  { x: 85, y: 86 }, // Biblioteca
  { x: 75, y: 80 }, // Elevador
  { x: 95, y: 90 }, // Geral
]

async function getMetersFull(filter: ToggleSearchSchema): Promise<Meter[]> {
  const response = await getMeters()
  const data = response.data

  return fixedPositions.map((position, index) => {
    const meter = data[index]

    if (!meter) {
      throw new Error(`Faltam dados para o medidor ${index}`)
    }

    if (filter.type === 'frequency') {
      return {
        ...meter,
        unit: 'Hz',
        position,
        limits: { min: 58, max: 61 },
      }
    }

    if (filter.type === 'current') {
      return {
        ...meter,
        unit: 'A',
        position,
        limits: { min: -1, max: 5 },
      }
    }

    if (filter.type === 'power') {
      return {
        ...meter,
        unit: 'W',
        position,
        limits: { min: -1, max: 4000 },
      }
    }

    return {
      ...meter,
      unit: 'V',
      position,
      limits: { min: 210, max: 224 },
    }
  })
}

function getSensorHistory(
  telemetryData: GetTelemetry200DataItem[],
  filter: ToggleSearchSchema
): Array<{ time: string; value: number }> {
  if (!telemetryData || telemetryData.length === 0) {
    return []
  }

  if (filter.type === 'frequency') {
    return telemetryData
      .filter((item) => item.frequencia !== null)
      .map((item) => ({
        time: dayjs(item.time).format('HH:mm:ss'),
        value: Number((item.frequencia ?? 0).toFixed(2)),
      }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  if (filter.type === 'current') {
    return telemetryData
      .filter((item) => item.correnteA !== null)
      .map((item) => ({
        time: dayjs(item.time).format('HH:mm:ss'),
        value: Number((item.correnteA ?? 0).toFixed(2)),
      }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  if (filter.type === 'power') {
    return telemetryData
      .filter((item) => item.potenciaAparenteTotalAritmetica !== null)
      .map((item) => ({
        time: dayjs(item.time).format('HH:mm:ss'),
        value: Number((item.potenciaAparenteTotalAritmetica ?? 0).toFixed(2)),
      }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  return telemetryData
    .filter((item) => item.tensaoFaseNeutroA !== null)
    .map((item) => ({
      time: dayjs(item.time).format('HH:mm:ss'),
      value: Number((item.tensaoFaseNeutroA ?? 0).toFixed(2)),
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

function calculateSensorStatus(
  value: number,
  limits: { min: number; max: number }
): Sensor['status'] {
  const { min, max } = limits
  const range = max - min
  const threshold = 0.1 * range

  if (value < min || value > max) {
    return 'critical'
  }

  const nearMin = value >= min && value <= min + threshold
  const nearMax = value <= max && value >= max - threshold

  if (nearMin || nearMax) {
    return 'warning'
  }

  return 'normal'
}

function calculateSensorTrend(
  last?: { value: number },
  prev?: { value: number }
): Sensor['trend'] {
  const threshold = 0.5
  if (!(last && prev)) {
    return 'stable'
  }

  const diff = last.value - prev.value

  if (diff > threshold) {
    return 'up'
  }

  if (diff < -threshold) {
    return 'down'
  }

  return 'stable'
}

export function useSensors(
  filter: ToggleSearchSchema,
  period: GetTelemetryPeriod
) {
  const {
    data: meters,
    isLoading: metersLoading,
    error: metersError,
  } = useQuery({
    queryKey: ['Meters', filter.type],
    queryFn: () => getMetersFull(filter),
  })

  const telemetryQueries = useQueries({
    queries:
      meters?.map((meter) => ({
        refetchInterval: 1000 * 30,
        queryKey: ['Telemetry', meter.id, period],
        queryFn: async (): Promise<GetTelemetry200> => {
          const response = await getTelemetry({
            period,
            meterId: meter.id,
          })
          return response.data
        },
        enabled: !!meters,
      })) || [],
  })

  const sensorsData = meters?.map((meter, index) => {
    const telemetryQuery = telemetryQueries[index]
    const telemetryResponse = telemetryQuery?.data
    const telemetryData = telemetryResponse?.data || []

    const history = getSensorHistory(telemetryData, filter)
    const lastMeasure = history.at(-1)
    const prevMeasure = history.at(-2)

    const value = lastMeasure?.value ?? 0
    const status = calculateSensorStatus(value, meter.limits)
    const trend = calculateSensorTrend(lastMeasure, prevMeasure)

    return {
      id: meter.id,
      description: meter.description || '',
      limits: meter.limits,
      name: meter.name,
      position: meter.position,
      unit: meter.unit,
      status,
      trend,
      value,
      lastUpdate: lastMeasure?.time ?? dayjs().format('HH:mm'),
      history,
    } satisfies Sensor
  })

  const isLoading =
    metersLoading || telemetryQueries.some((query) => query.isLoading)

  const error =
    metersError || telemetryQueries.find((query) => query.error)?.error

  return {
    data: sensorsData,
    isLoading,
    error,
  }
}
