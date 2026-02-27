import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'
import { formatTime } from '../../-utils/format-time'

interface VoltageChartProps {
  data: GetTelemetry200DataItem[] | undefined
  isLoading: boolean
}

const chartConfig = {
  voltageA: {
    label: 'Fase A',
    color: 'hsl(var(--chart-1))',
  },
  voltageB: {
    label: 'Fase B',
    color: 'hsl(var(--chart-2))',
  },
  voltageC: {
    label: 'Fase C',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export function VoltageChart({ data, isLoading }: VoltageChartProps) {
  const chartData = data?.map((item) => ({
    time: formatTime(item.time),
    voltageA: item.tensaoFaseNeutroA,
    voltageB: item.tensaoFaseNeutroB,
    voltageC: item.tensaoFaseNeutroC,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tensão Fase-Neutro</CardTitle>
        <CardDescription>Tensão por fase ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        ) : (
          <ChartContainer className="h-[300px]" config={chartConfig}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} tickLine={false} />
              <YAxis
                axisLine={false}
                fontSize={12}
                label={{
                  value: 'V',
                  angle: -90,
                  position: 'insideLeft',
                }}
                tickLine={false}
              />
              <Tooltip />
              <Legend />
              <Line
                dataKey="voltageA"
                dot={false}
                name="Fase A"
                stroke="var(--color-voltageA)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="voltageB"
                dot={false}
                name="Fase B"
                stroke="var(--color-voltageB)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="voltageC"
                dot={false}
                name="Fase C"
                stroke="var(--color-voltageC)"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
