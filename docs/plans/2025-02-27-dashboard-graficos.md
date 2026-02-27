# Dashboard Executivo de Gráficos - Implementation Plan (Corrigido)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformar a rota `/gráficos` em um dashboard executivo com KPIs e gráficos fixos usando dados reais da API.

**Architecture:** Estrutura em duas seções: (1) KPIs no topo com 4 indicadores consolidados, (2) Grid 2x2 de gráficos temporais. Usa TanStack Router loaders + queryOptions com factory pattern do projeto. Transforma dados via `select` para memoização.

**Tech Stack:** TanStack Router, TanStack Query (queryOptions + factory keys), Recharts, shadcn/ui, TypeScript

---

### Task 1: Adicionar telemetryKeys ao factory pattern

**Files:**
- Modify: `apps/web/src/lib/query-keys.ts`

**Step 1: Adicionar chave por meterId ao telemetryKeys**

```typescript
// Adicionar em telemetryKeys:
byMeterId: (meterId: number, period?: string) => 
  [...telemetryKeys.all, 'meterId', meterId, period] as const,
```

```bash
git add apps/web/src/lib/query-keys.ts
git commit -m "refactor(queries): add telemetryKeys.byMeterId"
```

---

### Task 2: Atualizar tipos e schema de busca

**Files:**
- Modify: `apps/web/src/routes/(dashboard)/gráficos/-types.ts`

**Step 1: Substituir o schema de busca com .catch()**

```typescript
import { z } from 'zod'
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period.gen'

export const dashboardSearchSchema = z.object({
  meterId: z.string().optional(),
  period: z.enum(GetTelemetryPeriod).catch('last_1_hour'),
})

export type DashboardSearchSchema = z.infer<typeof dashboardSearchSchema>

export type TelemetryDataPoint = {
  time: string
  tensaoFaseNeutroA?: number
  tensaoFaseNeutroB?: number
  tensaoFaseNeutroC?: number
  correnteA?: number
  correnteB?: number
  correnteC?: number
  potenciaAtivaFundamentalHarmonicaTotal?: number
  fpRealFaseA?: number
  fpRealFaseB?: number
  fpRealFaseC?: number
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-types.ts
git commit -m "refactor(graphs): update types with .catch() for safe defaults"
```

---

### Task 3: Criar hook useTelemetryData

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-hooks/use-telemetry-data.ts`

**Step 1: Criar hook usando queryOptions e select**

```typescript
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { telemetryKeys } from '@/lib/query-keys'
import { getTelemetry } from '@/http/gen/endpoints/lapes-api.gen'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'

export function useTelemetryData(meterId: number | undefined, period: string | undefined) {
  const query = useQuery({
    ...telemetryQueries.byParams({
      meterId: meterId,
      period: period as any,
    }),
    enabled: !!meterId && !!period,
    select: useMemo(
      () => (data: { data: GetTelemetry200DataItem[] }) => data?.data ?? [],
      []
    ),
  })

  return query
}

// Agregar queryOptions para reuse
export const telemetryQueries = {
  byParams: (params: { meterId?: number; period?: string }) =>
    queryOptions({
      queryKey: telemetryKeys.byMeterId(params.meterId!, params.period),
      queryFn: async () => {
        const result = await getTelemetry({
          meterId: params.meterId,
          period: params.period as any,
        })
        return result.data
      },
      staleTime: 30 * 1000,
      enabled: !!params.meterId && !!params.period,
    }),
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-hooks/use-telemetry-data.ts
git commit -m "feat(graphs): add useTelemetryData hook with queryOptions"
```

---

### Task 4: Criar componente de seletor de período

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-components/period-selector.tsx`

**Step 1: Criar o componente**

```typescript
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period.gen'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const periodLabels: Record<GetTelemetryPeriod, string> = {
  last_5_minutes: 'Últimos 5 minutos',
  last_15_minutes: 'Últimos 15 minutos',
  last_30_minutes: 'Últimos 30 minutos',
  last_hour: 'Última hora',
  last_6_hours: 'Últimas 6 horas',
  last_12_hours: 'Últimas 12 horas',
  last_24_hours: 'Últimas 24 horas',
  last_7_days: 'Últimos 7 dias',
  this_month: 'Este mês',
  last_30_days: 'Últimos 30 dias',
  this_year: 'Este ano',
  today: 'Hoje',
}

interface PeriodSelectorProps {
  value: GetTelemetryPeriod
  onChange: (value: GetTelemetryPeriod) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(periodLabels).map(([period, label]) => (
          <SelectItem key={period} value={period}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-components/period-selector.tsx
git commit -m "feat(graphs): add period selector component"
```

---

### Task 5: Criar componente de KPI Card

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-components/kpi-card.tsx`

**Step 1: Criar o componente**

```typescript
import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface KpiCardProps {
  title: string
  value: string | number
  unit: string
  icon: LucideIcon
  description?: string
  isLoading?: boolean
}

export function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  isLoading,
}: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-2xl">{value}</span>
            <span className="text-muted-foreground text-sm">{unit}</span>
          </div>
        )}
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-components/kpi-card.tsx
git commit -m "feat(graphs): add KPI card component"
```

---

### Task 6: Criar utilitários para cálculos de KPIs

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-utils/kpi-calculations.ts`

**Step 1: Criar utilitário para cálculos (fora do componente)**

```typescript
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'

export interface KpiValues {
  activePowerTotal: number
  avgPowerFactor: number
  avgVoltage: number
  maxDemand: number
}

export function calculateKpis(data: GetTelemetry200DataItem[] | undefined): KpiValues {
  if (!data || data.length === 0) {
    return {
      activePowerTotal: 0,
      avgPowerFactor: 0,
      avgVoltage: 0,
      maxDemand: 0,
    }
  }

  const latestData = data[data.length - 1]

  const activePowerTotal =
    (latestData.potenciaAtivaFundamentalHarmonicaA ?? 0) +
    (latestData.potenciaAtivaFundamentalHarmonicaB ?? 0) +
    (latestData.potenciaAtivaFundamentalHarmonicaC ?? 0)

  const avgPowerFactor =
    ((latestData.fpRealFaseA ?? 0) +
      (latestData.fpRealFaseB ?? 0) +
      (latestData.fpRealFaseC ?? 0)) /
    3

  const avgVoltage =
    ((latestData.tensaoFaseNeutroA ?? 0) +
      (latestData.tensaoFaseNeutroB ?? 0) +
      (latestData.tensaoFaseNeutroC ?? 0)) /
    3

  const maxDemand = Math.max(
    ...data.map((d) => d.potenciaAtivaFundamentalHarmonicaTotal ?? 0)
  )

  return {
    activePowerTotal: activePowerTotal / 1000,
    avgPowerFactor,
    avgVoltage,
    maxDemand: maxDemand / 1000,
  }
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-utils/kpi-calculations.ts
git commit -m "feat(graphs): add KPI calculation utilities"
```

---

### Task 7: Criar componente de KPIs

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-components/kpi-grid.tsx`

**Step 1: Criar o componente usando utilitário**

```typescript
import { Zap, Activity, Gauge, TrendingUp } from 'lucide-react'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'
import { KpiCard } from './kpi-card'
import { calculateKpis, type KpiValues } from '../-utils/kpi-calculations'

interface KpiGridProps {
  data: GetTelemetry200DataItem[] | undefined
  isLoading: boolean
}

export function KpiGrid({ data, isLoading }: KpiGridProps) {
  const kpis: KpiValues = calculateKpis(data)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        description="Soma das 3 fases"
        icon={Zap}
        isLoading={isLoading}
        title="Potência Ativa"
        unit="kW"
        value={kpis.activePowerTotal.toFixed(2)}
      />
      <KpiCard
        description="Média das 3 fases"
        icon={Activity}
        isLoading={isLoading}
        title="Fator de Potência"
        unit=""
        value={kpis.avgPowerFactor.toFixed(3)}
      />
      <KpiCard
        description="Média fase-neutro"
        icon={Gauge}
        isLoading={isLoading}
        title="Tensão Média"
        unit="V"
        value={kpis.avgVoltage.toFixed(1)}
      />
      <KpiCard
        description="Pico no período"
        icon={TrendingUp}
        isLoading={isLoading}
        title="Demanda Máxima"
        unit="kW"
        value={kpis.maxDemand.toFixed(2)}
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-components/kpi-grid.tsx
git commit -m "feat(graphs): add KPI grid component"
```

---

### Task 8: Criar utilitário de formatação de tempo

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-utils/format-time.ts`

**Step 1: Criar utilitário (fora do componente para evitar recriação)**

```typescript
export function formatTime(timeString: string): string {
  const date = new Date(timeString)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(timeString: string): string {
  const date = new Date(timeString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-utils/format-time.ts
git commit -m "feat(graphs): add time formatting utilities"
```

---

### Task 9: Criar componente de gráfico de tensão

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-components/charts/voltage-chart.tsx`

**Step 1: Criar o componente**

```typescript
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
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
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'V',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                dataKey="voltageA"
                name="Fase A"
                stroke="var(--color-voltageA)"
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
              <Line
                dataKey="voltageB"
                name="Fase B"
                stroke="var(--color-voltageB)"
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
              <Line
                dataKey="voltageC"
                name="Fase C"
                stroke="var(--color-voltageC)"
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-components/charts/voltage-chart.tsx
git commit -m "feat(graphs): add voltage chart component"
```

---

### Task 10: Criar componentes de gráfico restantes

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-components/charts/current-chart.tsx`
- Create: `apps/web/src/routes/(dashboard)/gráficos/-components/charts/power-chart.tsx`
- Create: `apps/web/src/routes/(dashboard)/gráficos/-components/charts/power-factor-chart.tsx`

**Step 1: Criar CurrentChart (similar ao VoltageChart)**

```typescript
// current-chart.tsx
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'
import { formatTime } from '../../-utils/format-time'

interface CurrentChartProps {
  data: GetTelemetry200DataItem[] | undefined
  isLoading: boolean
}

const chartConfig = {
  currentA: { label: 'Fase A', color: 'hsl(var(--chart-1))' },
  currentB: { label: 'Fase B', color: 'hsl(var(--chart-2))' },
  currentC: { label: 'Fase C', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

export function CurrentChart({ data, isLoading }: CurrentChartProps) {
  const chartData = data?.map((item) => ({
    time: formatTime(item.time),
    currentA: item.correnteA,
    currentB: item.correnteB,
    currentC: item.correnteC,
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
              <YAxis fontSize={12} tickLine={false} axisLine={false} label={{ value: 'A', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line dataKey="currentA" name="Fase A" stroke="var(--color-currentA)" strokeWidth={2} dot={false} type="monotone" />
              <Line dataKey="currentB" name="Fase B" stroke="var(--color-currentB)" strokeWidth={2} dot={false} type="monotone" />
              <Line dataKey="currentC" name="Fase C" stroke="var(--color-currentC)" strokeWidth={2} dot={false} type="monotone" />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Criar PowerChart**

```typescript
// power-chart.tsx
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'
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
        <CardDescription>Potência ativa total ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        ) : (
          <ChartContainer className="h-[300px]" config={chartConfig}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} label={{ value: 'kW', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line dataKey="activePower" name="Potência Ativa" stroke="var(--color-activePower)" strokeWidth={2} dot={false} type="monotone" />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 3: Criar PowerFactorChart**

```typescript
// power-factor-chart.tsx
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'
import { formatTime } from '../../-utils/format-time'

interface PowerFactorChartProps {
  data: GetTelemetry200DataItem[] | undefined
  isLoading: boolean
}

const chartConfig = {
  pfA: { label: 'Fase A', color: 'hsl(var(--chart-1))' },
  pfB: { label: 'Fase B', color: 'hsl(var(--chart-2))' },
  pfC: { label: 'Fase C', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

export function PowerFactorChart({ data, isLoading }: PowerFactorChartProps) {
  const chartData = data?.map((item) => ({
    time: formatTime(item.time),
    pfA: item.fpRealFaseA,
    pfB: item.fpRealFaseB,
    pfC: item.fpRealFaseC,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fator de Potência</CardTitle>
        <CardDescription>Fator de potência por fase ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        ) : (
          <ChartContainer className="h-[300px]" config={chartConfig}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 1]} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Line dataKey="pfA" name="Fase A" stroke="var(--color-pfA)" strokeWidth={2} dot={false} type="monotone" />
              <Line dataKey="pfB" name="Fase B" stroke="var(--color-pfB)" strokeWidth={2} dot={false} type="monotone" />
              <Line dataKey="pfC" name="Fase C" stroke="var(--color-pfC)" strokeWidth={2} dot={false} type="monotone" />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 4: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-components/charts/current-chart.tsx
git add apps/web/src/routes/\(dashboard\)/gráficos/-components/charts/power-chart.tsx
git add apps/web/src/routes/\(dashboard\)/gráficos/-components/charts/power-factor-chart.tsx
git commit -m "feat(graphs): add remaining chart components"
```

---

### Task 11: Criar componente de grid de gráficos

**Files:**
- Create: `apps/web/src/routes/(dashboard)/gráficos/-components/charts-grid.tsx`

**Step 1: Criar o componente**

```typescript
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'
import { CurrentChart } from './charts/current-chart'
import { PowerChart } from './charts/power-chart'
import { PowerFactorChart } from './charts/power-factor-chart'
import { VoltageChart } from './charts/voltage-chart'

interface ChartsGridProps {
  data: GetTelemetry200DataItem[] | undefined
  isLoading: boolean
}

export function ChartsGrid({ data, isLoading }: ChartsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <VoltageChart data={data} isLoading={isLoading} />
      <CurrentChart data={data} isLoading={isLoading} />
      <PowerChart data={data} isLoading={isLoading} />
      <PowerFactorChart data={data} isLoading={isLoading} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/-components/charts-grid.tsx
git commit -m "feat(graphs): add charts grid component"
```

---

### Task 12: Refatorar rota principal

**Files:**
- Modify: `apps/web/src/routes/(dashboard)/gráficos/route.tsx`

**Step 1: Reescrever a rota principal com loader + hook**

```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/shadcn-io/combobox'
import { ChartsGrid } from './-components/charts-grid'
import { KpiGrid } from './-components/kpi-grid'
import { PeriodSelector } from './-components/period-selector'
import { useTelemetryData } from './-hooks/use-telemetry-data'
import { dashboardSearchSchema } from './-types'
import type { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period.gen'

export const Route = createFileRoute('/(dashboard)/gráficos')({
  component: RouteComponent,
  validateSearch: dashboardSearchSchema,
  loader: ({ context }) => {
    const metersOptions = context.meters.map((meter) => ({
      value: meter.id.toString(),
      label: meter.description ?? `Medidor ${meter.ip}`,
    }))
    return { metersOptions }
  },
})

function RouteComponent() {
  const { metersOptions } = Route.useLoaderData()
  const { meterId, period } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { data: telemetryData, isLoading } = useTelemetryData(
    meterId ? Number(meterId) : undefined,
    period
  )

  const handleMeterSelect = (selectedMeterId: string) => {
    navigate({
      search: (prev) => ({ ...prev, meterId: selectedMeterId || undefined }),
    })
  }

  const handlePeriodChange = (newPeriod: GetTelemetryPeriod) => {
    navigate({
      search: (prev) => ({ ...prev, period: newPeriod }),
    })
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Gráficos</CardTitle>
          <CardDescription>
            Visualize indicadores e gráficos temporais dos medidores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label className="font-medium text-sm">Medidor</Label>
              <Combobox
                data={metersOptions}
                onValueChange={handleMeterSelect}
                type="medidor"
              >
                <ComboboxTrigger className="w-full" />
                <ComboboxContent className="w-full">
                  <ComboboxInput placeholder="Buscar medidor..." />
                  <ComboboxEmpty>Nenhum medidor encontrado.</ComboboxEmpty>
                  <ComboboxList>
                    <ComboboxGroup>
                      {metersOptions.map((meter) => (
                        <ComboboxItem
                          className="cursor-pointer py-3"
                          key={meter.value}
                          value={meter.value}
                        >
                          <div className="flex w-full flex-col gap-1">
                            <span className="font-medium text-base leading-tight">
                              {meter.label}
                            </span>
                          </div>
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-sm">Período</Label>
              <PeriodSelector
                value={period}
                onChange={handlePeriodChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!meterId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Selecione um medidor para visualizar os gráficos
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div>
            <h2 className="mb-4 font-semibold text-lg">Indicadores</h2>
            <KpiGrid data={telemetryData} isLoading={isLoading} />
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-lg">Gráficos</h2>
            <ChartsGrid data={telemetryData} isLoading={isLoading} />
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/routes/\(dashboard\)/gráficos/route.tsx
git commit -m "feat(graphs): refactor route to executive dashboard"
```

---

### Task 13: Remover arquivos obsoletos

**Files:**
- Delete: `apps/web/src/routes/(dashboard)/gráficos/$meterId.tsx`
- Delete: `apps/web/src/routes/(dashboard)/gráficos/-components/charts-list.tsx`
- Delete: `apps/web/src/routes/(dashboard)/gráficos/-components/chart-card.tsx`

**Step 1: Remover arquivos**

```bash
rm apps/web/src/routes/\(dashboard\)/gráficos/\$meterId.tsx
rm apps/web/src/routes/\(dashboard\)/gráficos/-components/charts-list.tsx
rm apps/web/src/routes/\(dashboard\)/gráficos/-components/chart-card.tsx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "refactor(graphs): remove obsolete chart components"
```

---

### Task 14: Verificar e corrigir build/lint

**Step 1: Executar typecheck**

```bash
pnpm --filter web typecheck
```

**Step 2: Executar lint**

```bash
pnpm --filter web lint
```

**Step 3: Corrigir quaisquer erros encontrados**

**Step 4: Commit correções se necessário**

```bash
git add -A
git commit -m "fix(graphs): resolve type/lint errors"
```

---

### Resumo das Correções Aplicadas

| Problema Original | Correção Aplicada |
|-------------------|-------------------|
| Query keys sem factory | Usa `telemetryKeys` de `lib/query-keys.ts` |
| Query no componente | Criado hook `useTelemetryData` com `queryOptions` |
| Sem `select` para transformações | Hook usa `select` para memoizar transformação |
| Funções `formatTime` dentro do componente | Extraídas para `-utils/format-time.ts` |
| Schema sem `.catch()` | Adicionado `.catch('last_1_hour')` |
| Não reutiliza hooks gerados | Usa `telemetryQueries.byParams` com queryOptions |

---

### Summary

- **14 tasks** que transformam a rota `/gráficos` em um dashboard executivo
- Segue melhores práticas: TanStack Router loaders, TanStack Query queryOptions + factory keys, utilitários fora de componentes
- KPIs: Potência Ativa, Fator de Potência, Tensão Média, Demanda Máxima
- Gráficos: Tensão, Corrente, Potência Ativa, Fator de Potência
- Usa API `getTelemetry` com filtros de medidor e período
- Remove sistema antigo de gráficos personalizáveis
