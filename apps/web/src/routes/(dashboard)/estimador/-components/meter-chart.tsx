import { Activity, Gauge } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
import { useMeterNames, useVoltageChartData } from './use-voltage-chart'

const chartConfig = {
  actual: {
    label: 'Tensão Real',
    color: 'var(--chart-2)',
  },
  estimated: {
    label: 'Tensão Estimada',
    color: 'var(--chart-4)',
  },
  error: {
    label: 'Erro',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

interface MeterChartProps {
  selectedMeterId?: number
}

export function MeterChart({ selectedMeterId }: MeterChartProps) {
  const { data: meters } = useMeterNames()
  const { data: chartData } = useVoltageChartData(selectedMeterId)

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
          Estimação vs Real
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
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickFormatter={(value) => `${value}V`}
                tickLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="dashed" />}
                cursor={false}
              />
              <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
              <Bar
                dataKey="estimated"
                fill="var(--color-estimated)"
                radius={4}
              />
              <Bar dataKey="error" fill="var(--color-error)" radius={4} />
            </BarChart>
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
                de estimação e erro dos últimos 5 minutos.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <Activity className="h-4 w-4 text-primary" />
          Erro = Tensão Real - Tensão Estimada
        </div>
        <div className="text-muted-foreground leading-none">
          {selectedMeter
            ? 'Clique na linha selecionada na tabela para desmarcar o medidor'
            : 'Nenhum medidor selecionado'}
        </div>
      </CardFooter>
    </Card>
  )
}
