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
    (latestData.measurements?.potenciaAtivaFundamentalHarmonicaA ?? 0) +
    (latestData.measurements?.potenciaAtivaFundamentalHarmonicaB ?? 0) +
    (latestData.measurements?.potenciaAtivaFundamentalHarmonicaC ?? 0)

  const avgPowerFactor =
    ((latestData.measurements?.fpRealFaseA ?? 0) +
      (latestData.measurements?.fpRealFaseB ?? 0) +
      (latestData.measurements?.fpRealFaseC ?? 0)) /
    3

  const avgVoltage =
    ((latestData.measurements?.tensaoFaseNeutroA ?? 0) +
      (latestData.measurements?.tensaoFaseNeutroB ?? 0) +
      (latestData.measurements?.tensaoFaseNeutroC ?? 0)) /
    3

  const maxDemand = Math.max(
    ...data.map(
      (d) => d.measurements?.potenciaAtivaFundamentalHarmonicaTotal ?? 0
    )
  )

  return {
    activePowerTotal: activePowerTotal / 1000,
    avgPowerFactor,
    avgVoltage,
    maxDemand: maxDemand / 1000,
  }
}
