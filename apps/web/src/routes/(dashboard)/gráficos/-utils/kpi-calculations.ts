import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'

export interface KpiValues {
  activePowerTotal: number
  avgPowerFactor: number
  avgVoltage: number
  maxDemand: number
}

export function calculateKpis(
  data: GetTelemetry200DataItem[] | undefined
): KpiValues {
  if (!data || data.length === 0) {
    return {
      activePowerTotal: 0,
      avgPowerFactor: 0,
      avgVoltage: 0,
      maxDemand: 0,
    }
  }

  const latestData = data.at(-1)

  if (!latestData) {
    return {
      activePowerTotal: 0,
      avgPowerFactor: 0,
      avgVoltage: 0,
      maxDemand: 0,
    }
  }

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
