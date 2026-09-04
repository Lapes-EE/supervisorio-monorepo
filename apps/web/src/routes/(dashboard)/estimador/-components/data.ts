import type { EstimationItem } from "@/http/estimation-api"

export interface LastMeasurementData {
  erroPotenciaAtiva: number | null
  erroPotenciaReativa: number | null
  error: number | null
  estimation: number | null
  history: EstimationItem[]
  id: number
  isOverridden?: boolean
  meterId: number
  name: string
  potenciaAtivaEstimada: number | null
  potenciaAtivaFundamentalC: number | null
  potenciaReativaC: number | null
  potenciaReativaEstimada: number | null
  tensaoFaseNeutroA: number | null
  tensaoFaseNeutroB: number | null
  tensaoFaseNeutroC: number | null
  time: string
}
