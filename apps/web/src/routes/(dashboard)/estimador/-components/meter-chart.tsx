import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { useMeterNames, useVoltageChartData } from './use-voltage-chart'

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
]

interface MeterChartProps {
  selectedMeterId?: number
}

export function MeterChart({ selectedMeterId }: MeterChartProps) {
  const { data: chartData, isLoading } = useVoltageChartData(selectedMeterId)
  const { data: meters } = useMeterNames()

  if (isLoading || !chartData || chartData.length === 0) {
    return (
      <div className="h-[400px] w-full">
        <div className="h-full animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  const selectedMeter =
    selectedMeterId !== undefined
      ? meters?.find((m) => m.id === selectedMeterId)
      : undefined

  const meterNames = selectedMeter
    ? [selectedMeter.name]
    : (meters?.map((m) => m.name) ?? [])

  const chartConfig = meterNames.reduce(
    (acc, name, index) => {
      acc[name] = {
        label: name,
        color: COLORS[index % COLORS.length],
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>
  )

  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              fontSize={12}
              tickFormatter={(value: string) => {
                const date = new Date(value)
                return date.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              }}
            />
            <YAxis
              fontSize={12}
              label={{
                value: 'V',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const date = new Date(label)
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <p className="mb-2 font-semibold">
                        {date.toLocaleTimeString('pt-BR')}
                      </p>
                      {payload.map((entry: any) => (
                        <p
                          className="text-sm"
                          key={entry.name}
                          style={{ color: entry.color }}
                        >
                          {entry.name}: {entry.value?.toFixed(1)} V
                        </p>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            {meterNames.map((name, index) => (
              <Line
                dataKey={name}
                dot={false}
                key={name}
                name={name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                type="monotone"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
