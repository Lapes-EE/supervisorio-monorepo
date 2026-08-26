import { Activity, Gauge } from 'lucide-react'
import type { CSSProperties } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { EstimationItem } from '@/http/estimation-api'
import { MEASURE_CONFIG, type MeasureTypeSearch } from './types'
import { useMeasureChartData, useMeterNames } from './use-measure-chart'

const chartConfig = {
  actual: {
    label: 'Medido',
    color: 'var(--chart-2)',
  },
  estimated: {
    label: 'Estimado',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

interface MeterChartProps {
  selectedMeterId?: number
  selectedMeasure: MeasureTypeSearch['type']
  history?: EstimationItem[]
}

export function MeterChart({
  selectedMeterId,
  history = [],
  selectedMeasure,
}: MeterChartProps) {
  const { data: meters } = useMeterNames()
  const { data: chartData } = useMeasureChartData(selectedMeasure, history)

  const config = MEASURE_CONFIG[selectedMeasure]

  const selectedMeter = meters?.find((m) => m.id === selectedMeterId)

  let cardDescription = 'Selecione um medidor para visualizar o histórico'
  if (selectedMeter?.description) {
    cardDescription = selectedMeter.description
  } else if (selectedMeter) {
    cardDescription = 'Últimos 5 minutos'
  }

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader>
        <CardTitle>
          Medido vs Estimação
          {selectedMeter ? ` - ${selectedMeter.name}` : ''}
        </CardTitle>
        <CardDescription className="min-h-5">{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {selectedMeterId ? (
          <ChartContainer
            className="aspect-auto h-[380px] w-full"
            config={chartConfig}
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 24,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                axisLine={false}
                dataKey="label"
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value}${config.unit}`}
                tickLine={false}
                tickMargin={8}
              />
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
                            } as CSSProperties
                          }
                        />
                        {chartConfig[name as keyof typeof chartConfig]?.label ??
                          name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-medium font-mono text-foreground tabular-nums">
                          {typeof value === 'number' ? value.toFixed(2) : '—'}
                          <span className="font-normal text-muted-foreground">
                            {config.unit}
                          </span>
                        </div>
                      </>
                    )}
                    indicator="line"
                  />
                }
                cursor={true}
              />
              <Line
                activeDot={{
                  r: 6,
                }}
                dataKey="actual"
                dot={{
                  fill: 'var(--color-actual)',
                  strokeWidth: 2,
                  r: 4,
                }}
                stroke="var(--color-actual)"
                strokeWidth={2}
                type="monotone"
              />

              <Line
                activeDot={{
                  r: 6,
                }}
                dataKey="estimated"
                dot={{
                  fill: 'var(--color-estimated)',
                  strokeWidth: 2,
                  r: 4,
                }}
                stroke="var(--color-estimated)"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <Empty className="flex h-[380px] w-full flex-col items-center justify-center border border-dashed p-6">
            <EmptyMedia variant="icon">
              <Gauge className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Nenhum medidor selecionado</EmptyTitle>
              <EmptyDescription>
                Selecione um medidor na tabela ao lado para visualizar o gráfico
                de estimação dos últimos 5 minutos.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <Activity className="h-4 w-4 text-primary" />
          Resíduo = {config.label} Medida - {config.label} Estimada
        </div>
      </CardFooter>
    </Card>
  )
}
