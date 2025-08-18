import { useQueries, useQuery } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api.gen'
import type {
  GetTelemetry200,
  GetTelemetry200DataItem,
  GetTelemetryPeriod,
} from '@/http/gen/model'
import { dayjs } from '@/lib/dayjs'
import type { ToggleSearchSchema } from '../../-types'
import type { Meter, Sensor } from './types'

const fixedPositions: Array<{ x: number; y: number }> = [
  // Primeiro andar
  { x: 75, y: 90 },
  { x: 20, y: 90 },
  { x: 50, y: 90 },

  // Segundo andar
  { x: 20, y: 58 },
  { x: 50, y: 58 },
  { x: 75, y: 58 },

  // Terceiro andar
  { x: 50, y: 25 },
  { x: 75, y: 25 },
  { x: 20, y: 25 },

  // Auditório
  { x: 85, y: 45 },
  { x: 95, y: 45 },

  { x: 85, y: 86 }, // Biblioteca
  { x: 75, y: 75 }, // Elevador
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
): Array<
  | { time: string; phaseA: number; phaseB: number; phaseC: number }
  | { time: string; value: number }
> {
  if (!telemetryData || telemetryData.length === 0) {
    return []
  }

  // Para tipos que possuem dados por fase (current, power, voltage)
  if (
    filter.type === 'current' ||
    filter.type === 'power' ||
    filter.type === 'voltage'
  ) {
    return telemetryData.map((item) => {
      let phaseAValue: number
      let phaseBValue: number
      let phaseCValue: number

      switch (filter.type) {
        case 'current':
          phaseAValue = Number((item.correnteA ?? 0).toFixed(2))
          phaseBValue = Number((item.correnteB ?? 0).toFixed(2))
          phaseCValue = Number((item.correnteC ?? 0).toFixed(2))
          break

        case 'power':
          phaseAValue = Number(
            ((item.potenciaAparenteA ?? 0) / 1000).toFixed(2)
          )
          phaseBValue = Number(
            ((item.potenciaAparenteA ?? 0) / 1000).toFixed(2)
          )
          phaseCValue = Number(
            ((item.potenciaAparenteA ?? 0) / 1000).toFixed(2)
          )
          break

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
  }

  // Para frequency (valor único)
  if (filter.type === 'frequency') {
    return telemetryData
      .filter(
        (item) => item.frequencia !== null && item.frequencia !== undefined
      )
      .map((item) => ({
        time: dayjs(item.time).format('HH:mm:ss'),
        value: Number((item.frequencia ?? 0).toFixed(2)),
      }))
  }

  // Default: retorna tensão da fase A como valor único
  return telemetryData.map((item) => ({
    time: dayjs(item.time).format('HH:mm:ss'),
    value: Number((item.tensaoFaseNeutroA ?? 0).toFixed(2)),
  }))
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
          const response = await getTelemetry({
            period,
            meterId: meter.id,
          })
          return response.data
        },
        enabled: !!meters,
      })) || [],
  })

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: I will refactor this later
  const sensorsData = meters?.map((meter, index) => {
    const telemetryQuery = telemetryQueries[index]
    const telemetryResponse = telemetryQuery?.data
    const telemetryData = telemetryResponse?.data || []
    const history = getSensorHistory(telemetryData, filter)
    const lastMeasure = history.at(-1)
    const prevMeasure = history.at(-2)

    // Determina se é um sensor de fases múltiplas ou valor único
    const hasPhases =
      filter.type === 'current' ||
      filter.type === 'power' ||
      filter.type === 'voltage'

    if (hasPhases && lastMeasure && 'phaseA' in lastMeasure) {
      // Para sensores com múltiplas fases, retorna array com valores das 3 fases
      const valuePhaseA = lastMeasure.phaseA ?? 0
      const valuePhaseB = lastMeasure.phaseB ?? 0
      const valuePhaseC = lastMeasure.phaseC ?? 0
      const value = [valuePhaseA, valuePhaseB, valuePhaseC]

      const prevValuePhaseA =
        prevMeasure && 'phaseA' in prevMeasure ? (prevMeasure.phaseA ?? 0) : 0
      const prevValuePhaseB =
        prevMeasure && 'phaseA' in prevMeasure ? (prevMeasure.phaseB ?? 0) : 0
      const prevValuePhaseC =
        prevMeasure && 'phaseA' in prevMeasure ? (prevMeasure.phaseC ?? 0) : 0

      // const statusPhaseA = calculateSensorStatus(valuePhaseA, meter.limits)
      // const statusPhaseB = calculateSensorStatus(valuePhaseB, meter.limits)
      // const statusPhaseC = calculateSensorStatus(valuePhaseC, meter.limits)

      const avgCurrentValue = value.reduce((sum, val) => sum + val, 0) / 3
      const avgPrevValue =
        (prevValuePhaseA + prevValuePhaseB + prevValuePhaseC) / 3
      const trend = calculateSensorTrend(
        { value: avgCurrentValue, time: lastMeasure.time },
        { value: avgPrevValue, time: prevMeasure?.time ?? '' }
      )

      return {
        id: meter.id,
        description: meter.description || '',
        // limits: meter.limits,
        name: meter.name,
        position: meter.position,
        unit: meter.unit,
        hasPhases: true,
        // status: worstStatus,
        trend,
        value,
        lastUpdate: lastMeasure.time ?? dayjs().format('HH:mm'),
        history,
      } satisfies Sensor
    }

    // Para sensores de valor único (frequency e outros)
    const singleValue =
      lastMeasure && 'value' in lastMeasure ? lastMeasure.value : 0
    const value = [singleValue]
    const prevValue =
      prevMeasure && 'value' in prevMeasure ? prevMeasure.value : 0

    // const status = calculateSensorStatus(singleValue, meter.limits)
    const trend = calculateSensorTrend(
      { value: singleValue, time: lastMeasure?.time ?? '' },
      { value: prevValue, time: prevMeasure?.time ?? '' }
    )

    return {
      id: meter.id,
      description: meter.description || '',
      // limits: meter.limits,
      name: meter.name,
      position: meter.position,
      unit: meter.unit,
      hasPhases: false,
      // status,
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
