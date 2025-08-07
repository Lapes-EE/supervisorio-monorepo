import { useQuery } from '@tanstack/react-query'
import { getMeters } from '@/http/gen/endpoints/lapes-scada-api.gen'
import { dayjs } from '@/lib/dayjs'
import type { Sensor } from './types'

const fixedPositions: Array<{ x: number; y: number }> = [
  { x: 80, y: 75 },
  { x: 50, y: 75 },
  { x: 60, y: 65 },
  { x: 60, y: 75 },
  { x: 20, y: 75 },
  { x: 35, y: 75 },

  { x: 20, y: 50 },
  { x: 50, y: 50 },
  { x: 60, y: 50 },
  { x: 60, y: 40 },
  { x: 80, y: 50 },

  { x: 30, y: 25 },
  { x: 50, y: 25 },
  { x: 70, y: 25 },
]

interface Position {
  x: number
  y: number
}

interface Limits {
  min: number
  max: number
}

export interface Meter {
  id: number
  name: string
  ip: string
  description?: string | null
  unit: string
  position: Position
  limits: Limits
}

// Função 1: Busca os medidores com posição fixa aplicada
export async function getMetersFull(): Promise<Meter[]> {
  const response = await getMeters()
  const data = response.data

  return fixedPositions.map((position, index) => {
    const meter = data[index]

    if (!meter) {
      throw new Error(`Faltam dados para o medidor ${index}`)
    }

    return {
      ...meter,
      unit: 'kW',
      position,
      limits: { min: 20, max: 100 },
    }
  })
}

// Função 2: Gera histórico fictício
export function getSensorHistory(
  sensorId: number
): Array<{ time: string; value: number }> {
  const idNum = Number(sensorId)

  return Array.from({ length: 10 }, (_, j) => {
    const time = dayjs('2024-01-23T08:00:00')
      .add(j * 5, 'minute')
      .format('HH:mm')

    const baseValue = 40 + (idNum % 10) * 5
    const value = Number((baseValue + j * 0.5).toFixed(2))

    return { time, value }
  })
}

// Função 3: Combina medidor + histórico + status/trend
export function getSensorDetails(meter: Meter): Sensor {
  const history = getSensorHistory(meter.id)
  const lastMeasure = history.at(-1)
  const prevMeasure = history.at(-2)

  // Status cíclico
  const statusIndex = Number(meter.id) - 101
  let status: Sensor['status'] = 'normal'
  if (statusIndex % 7 === 6) {
    status = 'critical'
  } else if (statusIndex % 7 === 5) {
    status = 'warning'
  }

  // Tendência
  let trend: Sensor['trend'] = 'stable'
  if (lastMeasure && prevMeasure) {
    if (lastMeasure.value > prevMeasure.value) {
      trend = 'up'
    } else if (lastMeasure.value < prevMeasure.value) {
      trend = 'down'
    }
  }

  return {
    id: meter.id,
    description: meter.description || '',
    limits: meter.limits,
    name: meter.name,
    position: meter.position,
    unit: meter.unit,
    status,
    trend,
    value: lastMeasure?.value ?? 0,
    lastUpdate: lastMeasure?.time ?? dayjs().format('HH:mm'),
    history,
  }
}

// Hook para buscar todos os sensores com detalhes
export function useSensors() {
  const {
    data: meters,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['Meters'],
    queryFn: getMetersFull,
  })

  const sensorsQuery = useQuery({
    queryKey: ['Sensors', meters?.map((m) => m.ip)],
    queryFn: () => {
      if (!meters) {
        return []
      }
      return Promise.all(meters.map((meter) => getSensorDetails(meter)))
    },
    enabled: !!meters,
  })

  return {
    data: sensorsQuery.data,
    isLoading: isLoading || sensorsQuery.isLoading,
    error: error || sensorsQuery.error,
  }
}
