import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { Sensor } from './types'

interface SensorChartProps {
  sensor: Sensor | null
}

export function SensorChart({ sensor }: SensorChartProps) {
  const chartConfig = {
    measure: {
      label: 'Medição',
      color: '#2563eb',
    },
  } satisfies ChartConfig

  if (!sensor) {
    return (
      <div className="text-center text-gray-500">Nenhum dado disponível</div>
    )
  }
  return (
    <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
      <LineChart accessibilityLayer data={sensor.history}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={['dataMin', 'dataMax']} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <>
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                    style={
                      {
                        '--color-bg': `var(--color-${name})`,
                      } as React.CSSProperties
                    }
                  />

                  <div className="ml-auto flex items-baseline gap-0.5 font-medium font-mono text-foreground tabular-nums">
                    {value}
                    {sensor.unit}
                  </div>
                </>
              )}
              labelFormatter={(value) => {
                return value
              }}
            />
          }
          cursor={true}
        />
        <Line
          dataKey="value"
          stroke={(() => {
            if (sensor.status === 'critical') {
              return '#ef4444'
            }
            if (sensor.status === 'warning') {
              return '#f59e0b'
            }
            return '#10b981'
          })()}
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  )
}
