import { useQueries, useQuery } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api.gen'
import type {
  GetTelemetry200,
  GetTelemetry200DataItem,
  GetTelemetryPeriod,
} from '@/http/gen/model'
import { dayjs } from '@/lib/dayjs'
import type { ToggleSearchSchema } from '../../-types'
import type { History, Meter, PhasePoint, Sensor } from './types'

export const fixedPositions: Array<{ id: number; x: number; y: number }> = [
  // Primeiro andar
  { id: 6, x: 15, y: 92 },
  { id: 10, x: 40, y: 92 },
  { id: 14, x: 67, y: 92 },

  // Segundo andar
  { id: 8, x: 15, y: 58 },
  { id: 4, x: 40, y: 58 },
  { id: 13, x: 67, y: 58 },

  // Terceiro andar
  { id: 11, x: 15, y: 25 },
  { id: 5, x: 40, y: 25 },
  { id: 3, x: 67, y: 25 },

  // Biblioteca
  { id: 12, x: 96, y: 25 },

  // Auditório
  { id: 9, x: 89, y: 55 },
  { id: 1, x: 96, y: 55 },

  // Elevador e Geral
  { id: 7, x: 88, y: 92 },
  { id: 2, x: 96, y: 79 },
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
        // limits: { min: 58, max: 61 },
      }
    }

    if (filter.type === 'current') {
      return {
        ...meter,
        unit: 'A',
        position,
        // limits: { min: -1, max: 5 },
      }
    }

    if (filter.type === 'power') {
      return {
        ...meter,
        unit: 'kW',
        position,
        // limits: { min: -1, max: 4000 },
      }
    }

    return {
      ...meter,
      unit: 'V',
      position,
      // limits: { min: 210, max: 224 },
    }
  })
}

function getSensorHistory(
  telemetryData: GetTelemetry200DataItem[],
  filter: ToggleSearchSchema
): History {
  // Agora todas as medições são tratadas como trifásicas
  const phases: PhasePoint[] = telemetryData.map((item) => {
    let phaseAValue = 0
    let phaseBValue = 0
    let phaseCValue = 0

    switch (filter.type) {
      case 'current':
        phaseAValue = Number((item.correnteA ?? 0).toFixed(2))
        phaseBValue = Number((item.correnteB ?? 0).toFixed(2))
        phaseCValue = Number((item.correnteC ?? 0).toFixed(2))
        break

      case 'power':
        phaseAValue = Number(((item.potenciaAparenteA ?? 0) / 1000).toFixed(2))
        phaseBValue = Number(((item.potenciaAparenteB ?? 0) / 1000).toFixed(2))
        phaseCValue = Number(((item.potenciaAparenteC ?? 0) / 1000).toFixed(2))
        break

      case 'frequency': {
        // Para frequência, replica o mesmo valor nas três fases
        const frequencyValue = Number((item.frequencia ?? 0).toFixed(2))
        phaseAValue = frequencyValue
        phaseBValue = frequencyValue
        phaseCValue = frequencyValue
        break
      }

      default:
        phaseAValue = Number((item.tensaoFaseNeutroA ?? 0).toFixed(2))
        phaseBValue = Number((item.tensaoFaseNeutroB ?? 0).toFixed(2))
        phaseCValue = Number((item.tensaoFaseNeutroC ?? 0).toFixed(2))
        break
    }

    return {
      time: dayjs(item.time).format('HH:mm:ss'),
      phaseA: phaseAValue,
      phaseB: phaseBValue,
      phaseC: phaseCValue,
    }
  })

  return { phases }
}

// function calculateSensorStatus(
//   value: number,
//   limits: { min: number; max: number }
// ): Sensor['status'] {
//   const { min, max } = limits
//   const range = max - min
//   const threshold = 0.1 * range

//   if (value < min || value > max) {
//     return 'critical'
//   }

//   const nearMin = value >= min && value <= min + threshold
//   const nearMax = value <= max && value >= max - threshold

//   if (nearMin || nearMax) {
//     return 'warning'
//   }

//   return 'normal'
// }

function calculateSensorTrend(
  last?: { value: number; time?: string },
  prev?: { value: number; time?: string }
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
          const response = await getTelemetry({ period, meterId: meter.id })
          return response.data
        },
        enabled: !!meters,
      })) ?? [],
  })

  const sensorsData = meters?.map((meter, index) => {
    const telemetryResponse = telemetryQueries[index]?.data
    const telemetryData = telemetryResponse?.data ?? []
    const history = getSensorHistory(telemetryData, filter)

    // Últimas medidas (sempre trifásicas agora)
    const lastMeasure = history.phases.at(-1)
    const prevMeasure = history.phases.at(-2)

    if (lastMeasure) {
      const value = [
        lastMeasure.phaseA ?? 0,
        lastMeasure.phaseB ?? 0,
        lastMeasure.phaseC ?? 0,
      ]
      const prevValue = [
        prevMeasure?.phaseA ?? 0,
        prevMeasure?.phaseB ?? 0,
        prevMeasure?.phaseC ?? 0,
      ]
      const avgCurrentValue =
        value.reduce((acc, v) => acc + v, 0) / value.length
      const avgPrevValue =
        prevValue.reduce((acc, v) => acc + v, 0) / prevValue.length
      const trend = calculateSensorTrend(
        { value: avgCurrentValue, time: lastMeasure.time },
        { value: avgPrevValue, time: prevMeasure?.time ?? '' }
      )

      return {
        id: meter.id,
        description: meter.description || '',
        name: meter.name,
        position: meter.position,
        unit: meter.unit,
        active: meter.active,
        trend,
        value,
        lastUpdate: lastMeasure.time ?? dayjs().format('HH:mm'),
        history,
      } satisfies Sensor
    }

    // Fallback para quando não há dados
    return {
      id: meter.id,
      description: meter.description || '',
      name: meter.name,
      position: meter.position,
      unit: meter.unit,
      active: meter.active,
      trend: 'stable' as const,
      value: [0, 0, 0],
      lastUpdate: dayjs().format('HH:mm'),
      history,
    } satisfies Sensor
  })

  const isLoading = metersLoading || telemetryQueries.some((q) => q.isLoading)

  const error = metersError || telemetryQueries.find((q) => q.error)?.error

  return { data: sensorsData, isLoading, error }
}
