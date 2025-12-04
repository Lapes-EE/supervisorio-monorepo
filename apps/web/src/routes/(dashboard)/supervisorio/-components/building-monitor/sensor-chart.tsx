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
import { getAggregationConfig, useSensors } from './data'
import type { Sensor } from './types'

interface SensorChartProps {
  sensor: Sensor
  search: ToggleSearchSchema
}

export function SensorChart({ sensor, search }: SensorChartProps) {
  const { data: sensors } = useSensors(search, search.period)

  const updatedSensor = useMemo(() => {
    return sensors?.find((s) => s.id === sensor.id) || sensor
  }, [sensors, sensor.id, sensor])

  const chartData = useMemo(() => {
    const { aggregation } = getAggregationConfig(search.period)

    if (search.period === 'today') {
      // Preencher intervalos de 30 em 30 minutos de 00:00 até 23:30
      const totalIntervals = 48 // 24 horas × 2 (a cada 30 min)
      const startOfDay = dayjs().startOf('day')

      return Array.from({ length: totalIntervals }, (_, i) => {
        const existingData = updatedSensor.history.phases[i]
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
      return updatedSensor.history.phases.map((phase) => ({
        ...phase,
        time: dayjs(phase.time).format('DD/MM'),
      }))
    }

    // Para outros períodos, formatar baseado na agregação
    return updatedSensor.history.phases.map((phase) => {
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
  }, [search.period, updatedSensor.history.phases])

  const chartConfig = {
    value: {
      label: 'Valor',
      color: 'var(--chart-4)',
    },
    phaseA: {
      label: 'Fase A',
      color: 'var(--chart-1)',
    },
    phaseB: {
      label: 'Fase B',
      color: 'var(--chart-2)',
    },
    phaseC: {
      label: 'Fase C',
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
                      {updatedSensor.unit}
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
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="phaseA"
          stroke="var(--color-phaseA)"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="phaseB"
          stroke="var(--color-phaseB)"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="phaseC"
          stroke="var(--color-phaseC)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  )
}
