import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { EstimationItem } from '@/http/estimation-api'
import { getMeters } from '@/http/gen/endpoints/lapes-api'
import type { MeasureTypeSearch } from './types'
import { MEASURE_CONFIG } from './types'

export interface EstimatorBarChartPoint {
  label: string
  time: string
  actual: number | null
  estimated: number | null
  error: number | null
}

export function buildMeasureChartData(
  history: EstimationItem[],
  selectedMeasure: MeasureTypeSearch['type']
): EstimatorBarChartPoint[] {
  const config = MEASURE_CONFIG[selectedMeasure]

  return history.map((item) => ({
    label: new Date(item.time ?? '').toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    time: item.time ?? '',
    actual: item[config.measuredApiKey],
    estimated: item[config.estimatedApiKey],
    error: item[config.errorApiKey],
  }))
}

export function useMeasureChartData(
  selectedMeasure: MeasureTypeSearch['type'],
  history: EstimationItem[]
) {
  return {
    data: useMemo(
      () => buildMeasureChartData(history, selectedMeasure),
      [history, selectedMeasure]
    ),
  }
}

export function useMeterNames() {
  return useQuery({
    queryKey: ['meters'],
    queryFn: () => getMeters(),
    staleTime: 60_000,
  })
}
