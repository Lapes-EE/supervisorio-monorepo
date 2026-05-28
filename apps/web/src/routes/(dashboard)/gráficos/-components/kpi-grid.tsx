import { Activity, Gauge, TrendingUp, Zap } from 'lucide-react'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import { calculateKpis, type KpiValues } from '../-utils/kpi-calculations'
import { KpiCard } from './kpi-card'

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
