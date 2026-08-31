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

interface PowerFactorChartProps {
  data: GetTelemetry200DataItem[] | undefined
  isLoading: boolean
}

const chartConfig = {
  pfA: { label: "Fase A", color: "hsl(var(--chart-1))" },
  pfB: { label: "Fase B", color: "hsl(var(--chart-2))" },
  pfC: { label: "Fase C", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

export function PowerFactorChart({ data, isLoading }: PowerFactorChartProps) {
  const chartData = data?.map((item) => ({
    time: formatTime(item.time),
    pfA: item.measurements?.fpRealFaseA,
    pfB: item.measurements?.fpRealFaseB,
    pfC: item.measurements?.fpRealFaseC,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fator de Potência</CardTitle>
        <CardDescription>
          Fator de potência por fase ao longo do tempo
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
                domain={[0, 1]}
                fontSize={12}
                tickLine={false}
              />
              <Tooltip />
              <Legend />
              <Line
                dataKey="pfA"
                dot={false}
                name="Fase A"
                stroke="var(--color-pfA)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="pfB"
                dot={false}
                name="Fase B"
                stroke="var(--color-pfB)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="pfC"
                dot={false}
                name="Fase C"
                stroke="var(--color-pfC)"
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
