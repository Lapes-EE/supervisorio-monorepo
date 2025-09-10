import { useQueries, useQuery } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api.gen'
import type {
  GetTelemetry200,
  GetTelemetry200DataItem,
  GetTelemetryPeriod,
} from '@/http/gen/model'
import { dayjs } from '@/lib/dayjs'
import type { ToggleSearchSchema } from '../../-types'
import type { History, Meter, PhasePoint, Sensor, SinglePoint } from './types'

const fixedPositions: Array<{ x: number; y: number }> = [
  // Primeiro andar
  { x: 67, y: 92 },
  { x: 40, y: 92 },
  { x: 15, y: 92 },

  // Segundo andar
  { x: 40, y: 58 },
  { x: 15, y: 58 },
  { x: 67, y: 58 },

  // Terceiro andar
  { x: 15, y: 25 },
  { x: 67, y: 25 },
  { x: 40, y: 25 },

  // Auditório
  { x: 88, y: 55 },
  { x: 94, y: 55 },

  { x: 91, y: 20 }, // Biblioteca
  { x: 88, y: 92 }, // Elevador
  { x: 96, y: 79 }, // Geral
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
  filter: ToggleSearchSchema,
  hasPhase: boolean
): History {
  if (!telemetryData?.length) {
    return { single: [], phases: [] }
  }

  // Sensores trifásicos (current, power, voltage)
  if (hasPhase) {
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
          phaseAValue = Number(
            ((item.potenciaAparenteA ?? 0) / 1000).toFixed(2)
          )
          phaseBValue = Number(
            ((item.potenciaAparenteB ?? 0) / 1000).toFixed(2)
          )
          phaseCValue = Number(
            ((item.potenciaAparenteC ?? 0) / 1000).toFixed(2)
          )
          break

        // 'voltage' e default
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

    return { phases, single: [] }
  }

  // Valor único (frequency) ou default (tensão fase A como single)
  if (filter.type === 'frequency') {
    const single: SinglePoint[] = telemetryData
      .filter(
        (item) => item.frequencia !== null && item.frequencia !== undefined
      )
      .map((item) => ({
        time: dayjs(item.time).format('HH:mm:ss'),
        value: Number((item.frequencia ?? 0).toFixed(2)),
      }))
    return { single, phases: [] }
  }

  const single: SinglePoint[] = telemetryData.map((item) => ({
    time: dayjs(item.time).format('HH:mm:ss'),
    value: Number((item.tensaoFaseNeutroA ?? 0).toFixed(2)),
  }))

  return { single, phases: [] }
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

  function isPhasePoint(point: SinglePoint | PhasePoint): point is PhasePoint {
    return 'phaseA' in point && 'phaseB' in point && 'phaseC' in point
  }

  function isSinglePoint(
    point: SinglePoint | PhasePoint
  ): point is SinglePoint {
    return 'value' in point
  }

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

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: i will refactor this later
  const sensorsData = meters?.map((meter, index) => {
    const telemetryResponse = telemetryQueries[index]?.data
    const telemetryData = telemetryResponse?.data ?? []
    const hasPhases =
      filter.type === 'current' ||
      filter.type === 'power' ||
      filter.type === 'voltage'
    const history = getSensorHistory(telemetryData, filter, hasPhases)

    // Últimas medidas conforme o tipo
    const lastMeasure = hasPhases
      ? history.phases.at(-1)
      : history.single.at(-1)
    const prevMeasure = hasPhases
      ? history.phases.at(-2)
      : history.single.at(-2)

    if (hasPhases && lastMeasure && isPhasePoint(lastMeasure)) {
      const value = [
        lastMeasure.phaseA ?? 0,
        lastMeasure.phaseB ?? 0,
        lastMeasure.phaseC ?? 0,
      ]
      const prevValue = [
        prevMeasure && isPhasePoint(prevMeasure)
          ? (prevMeasure.phaseA ?? 0)
          : 0,
        prevMeasure && isPhasePoint(prevMeasure)
          ? (prevMeasure.phaseB ?? 0)
          : 0,
        prevMeasure && isPhasePoint(prevMeasure)
          ? (prevMeasure.phaseC ?? 0)
          : 0,
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
        hasPhases: true,
        trend,
        value,
        lastUpdate: lastMeasure.time ?? dayjs().format('HH:mm'),
        history,
      } satisfies Sensor
    }

    // Valor único
    const singleValue =
      lastMeasure && isSinglePoint(lastMeasure) ? lastMeasure.value : 0
    const value = [singleValue]
    const prevValue =
      prevMeasure && isSinglePoint(prevMeasure) ? prevMeasure.value : 0
    const trend = calculateSensorTrend(
      { value: singleValue, time: lastMeasure?.time ?? '' },
      { value: prevValue, time: prevMeasure?.time ?? '' }
    )
    return {
      id: meter.id,
      description: meter.description || '',
      name: meter.name,
      position: meter.position,
      unit: meter.unit,
      hasPhases: false,
      active: meter.active,
      trend,
      value,
      lastUpdate: lastMeasure?.time ?? dayjs().format('HH:mm'),
      history,
    } satisfies Sensor
  })

  const isLoading = metersLoading || telemetryQueries.some((q) => q.isLoading)

  const error = metersError || telemetryQueries.find((q) => q.error)?.error

  return { data: sensorsData, isLoading, error }
}
