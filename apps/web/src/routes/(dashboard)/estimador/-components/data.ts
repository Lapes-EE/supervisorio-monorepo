import type { EstimationItem } from '@/http/estimation-api'

export type LastMeasurementData = {
  id: number
  meterId: number
  name: string
  time: string
  tensaoFaseNeutroA: number | null
  tensaoFaseNeutroB: number | null
  tensaoFaseNeutroC: number | null
  estimation: number | null
  error: number | null
  potenciaAtivaFundamentalC: number | null
  potenciaAtivaEstimada: number | null
  erroPotenciaAtiva: number | null
  potenciaReativaC: number | null
  potenciaReativaEstimada: number | null
  erroPotenciaReativa: number | null
  history: EstimationItem[]
  isOverridden?: boolean
}
