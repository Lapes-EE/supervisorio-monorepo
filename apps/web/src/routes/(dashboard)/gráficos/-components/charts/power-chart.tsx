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
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import { formatTime } from '../../-utils/format-time'

interface PowerChartProps {
  data: GetTelemetry200DataItem[] | undefined
  isLoading: boolean
}

const chartConfig = {
  activePower: { label: 'Potência Ativa', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

export function PowerChart({ data, isLoading }: PowerChartProps) {
  const chartData = data?.map((item) => ({
    time: formatTime(item.time),
    activePower: (item.potenciaAtivaFundamentalHarmonicaTotal ?? 0) / 1000,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência Ativa Total</CardTitle>
        <CardDescription>
          Potência ativa total ao longo do tempo
        </CardDescription>
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
                label={{ value: 'kW', angle: -90, position: 'insideLeft' }}
                tickLine={false}
              />
              <Tooltip />
              <Legend />
              <Line
                dataKey="activePower"
                dot={false}
                name="Potência Ativa"
                stroke="var(--color-activePower)"
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
