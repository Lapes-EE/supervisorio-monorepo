import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import type { GetTelemetry200DataItem } from "@/http/gen/model/get-telemetry200-data-item"
import { formatTime } from "../../-utils/format-time"

interface CurrentChartProps {
  data: GetTelemetry200DataItem[] | undefined
  isLoading: boolean
}

const chartConfig = {
  currentA: { label: "Fase A", color: "hsl(var(--chart-1))" },
  currentB: { label: "Fase B", color: "hsl(var(--chart-2))" },
  currentC: { label: "Fase C", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

export function CurrentChart({ data, isLoading }: CurrentChartProps) {
  const chartData = data?.map((item) => ({
    time: formatTime(item.time),
    currentA: item.measurements?.correnteA,
    currentB: item.measurements?.correnteB,
    currentC: item.measurements?.correnteC,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Corrente por Fase</CardTitle>
        <CardDescription>Corrente por fase ao longo do tempo</CardDescription>
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
                label={{ value: "A", angle: -90, position: "insideLeft" }}
                tickLine={false}
              />
              <Tooltip />
              <Legend />
              <Line
                dataKey="currentA"
                dot={false}
                name="Fase A"
                stroke="var(--color-currentA)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="currentB"
                dot={false}
                name="Fase B"
                stroke="var(--color-currentB)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="currentC"
                dot={false}
                name="Fase C"
                stroke="var(--color-currentC)"
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
