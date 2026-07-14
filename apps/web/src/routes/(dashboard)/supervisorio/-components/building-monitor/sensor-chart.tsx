import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { dayjs } from '@/lib/dayjs'
import type { ToggleSearchSchema } from '../../-types'
import { getPhaseLabels, isSingleValue } from './constants'
import { getAggregationConfig } from './data'
import { useSensorChart } from './sensor-chart-data'
import type { Sensor } from './types'

interface SensorChartProps {
  sensor: Sensor
  search: ToggleSearchSchema
}

export function SensorChart({ sensor, search }: SensorChartProps) {
  const { history } = useSensorChart(sensor.id, search.period, search)

  const sensorPhases = useMemo(() => {
    return history?.phases ?? sensor.history?.phases ?? []
  }, [history, sensor.history])

  const chartData = useMemo(() => {
    const { aggregation } = getAggregationConfig(search.period)

    if (search.period === 'today') {
      // Preencher intervalos de 30 em 30 minutos de 00:00 até 23:30
      const totalIntervals = 48 // 24 horas × 2 (a cada 30 min)
      const startOfDay = dayjs().startOf('day')

      return Array.from({ length: totalIntervals }, (_, i) => {
        const existingData = sensorPhases[i]
        const timeSlot = startOfDay.add(i * 30, 'minute')

        return {
          time: timeSlot.format('HH:mm:ss'),
          phaseA: existingData?.phaseA ?? null,
          phaseB: existingData?.phaseB ?? null,
          phaseC: existingData?.phaseC ?? null,
        }
      })
    }

    if (search.period === 'this_year') {
      // Para this_year, mostrar dias ao invés de horas
      return sensorPhases.map((phase) => ({
        ...phase,
        time: dayjs(phase.time).format('DD/MM'),
      }))
    }

    // Para outros períodos, formatar baseado na agregação
    return sensorPhases.map((phase) => {
      const timestamp = dayjs(phase.time)

      // Definir formato baseado na agregação
      let format = 'HH:mm:ss'

      if (aggregation === '1 day') {
        format = 'DD/MM'
      } else if (aggregation === '3 hours' || aggregation === '1 hour') {
        format = 'DD/MM HH:mm:ss'
      }

      return {
        ...phase,
        time: timestamp.format(format),
      }
    })
  }, [search.period, sensorPhases])

  const phaseLabels = getPhaseLabels(search.type)
  const isSingle = isSingleValue(search.type)

  const chartConfig = {
    phaseA: {
      label: phaseLabels[0] ?? 'Fase A',
      color: 'var(--chart-1)',
    },
    phaseB: {
      label: phaseLabels[1] ?? 'Fase B',
      color: 'var(--chart-2)',
    },
    phaseC: {
      label: phaseLabels[2] ?? 'Fase C',
      color: 'var(--chart-3)',
    },
  } satisfies ChartConfig

  if (!sensor) {
    return (
      <div className="text-center text-gray-500">Nenhum dado disponível</div>
    )
  }

  return (
    <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={['dataMin', 'dataMax']} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <>
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                    style={
                      {
                        '--color-bg': `var(--color-${name})`,
                      } as React.CSSProperties
                    }
                  />
                  {chartConfig[name as keyof typeof chartConfig]?.label || name}
                  <div className="ml-auto flex items-baseline gap-0.5 font-medium font-mono text-foreground tabular-nums">
                    {value}
                    <span className="font-normal text-muted-foreground">
                      {sensor.unit}
                    </span>
                  </div>
                </>
              )}
              indicator="dot"
              labelFormatter={(value) => {
                return value
              }}
            />
          }
          cursor={true}
        />
        <Line
          dataKey="phaseA"
          stroke="var(--color-phaseA)"
          strokeWidth={2}
          type="monotone"
        />
        {!isSingle && (
          <Line
            dataKey="phaseB"
            stroke="var(--color-phaseB)"
            strokeWidth={2}
            type="monotone"
          />
        )}
        {!isSingle && (
          <Line
            dataKey="phaseC"
            stroke="var(--color-phaseC)"
            strokeWidth={2}
            type="monotone"
          />
        )}
      </LineChart>
    </ChartContainer>
  )
}
