import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
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
