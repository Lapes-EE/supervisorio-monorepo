import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ToggleSearchSchema } from '../../-types'
import { useSensors } from './data'
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
    if (search.period === 'today') {
      // Preencher intervalos de 30 em 30 minutos sem dados com valor nulo
      const totalIntervals = 48 // 24 horas × 2 (a cada 30 min)
      const existingDataLength = updatedSensor.history.phases.length

      return [
        ...updatedSensor.history.phases,
        ...Array.from(
          { length: totalIntervals - existingDataLength },
          (_, i) => {
            const totalMinutes = (existingDataLength + i) * 30
            const hour = Math.floor(totalMinutes / 60)
            const minute = totalMinutes % 60

            return {
              time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
              value: null,
              phaseA: null,
              phaseB: null,
              phaseC: null,
            }
          }
        ),
      ]
    }

    return updatedSensor.history.phases
  }, [
    search.period,
    updatedSensor.history.phases,
    updatedSensor.history.phases.length,
  ])

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
