import { webEnv } from "@repo/env/web"
import axios from "axios"

export interface MeasurementOverride {
  meterId: number
  potenciaAtivaFundamentalC?: number | null
  potenciaReativaC?: number | null
  tensaoFaseNeutroC?: number | null
}

export interface EstimationRequest {
  overrides?: MeasurementOverride[]
}

export interface EstimationItem {
  barra: string
  /** Erro de potência ativa = medida - estimada (W) */
  erro_potencia_ativa_W: number | null
  /** Erro de potência reativa = medida - estimada (VAr) */
  erro_potencia_reativa_VAr: number | null
  erro_V: number | null
  ID_medidor: number
  indice_EE: number
  /** Potência ativa medida (W) */
  potencia_ativa_medida_W: number | null
  /** Potência ativa estimada (W) */
  potencia_ativa_W: number | null
  /** Potência reativa medida (VAr) */
  potencia_reativa_medida_VAr: number | null
  /** Potência reativa estimada (VAr) */
  potencia_reativa_VAr: number | null
  tensao_medida_V: number | null
  tensao_pu: number
  tensao_V: number
  time: string | null
}

export interface EstimationResponse {
  data: EstimationItem[]
  history: Array<{
    time: string
    data: EstimationItem[]
  }>
}

export async function getEstimation(): Promise<EstimationResponse> {
  const baseURL = webEnv.VITE_ESTIMATION_API_URL ?? "http://localhost:8000"
  const response = await axios.get<EstimationResponse>(`${baseURL}/estimation`)
  return response.data
}

export async function calculateEstimation(
  overrides: MeasurementOverride[] = []
): Promise<EstimationResponse> {
  const baseURL = webEnv.VITE_ESTIMATION_API_URL ?? "http://localhost:8000"
  const response = await axios.post<EstimationResponse>(
    `${baseURL}/estimation`,
    { overrides }
  )
  return response.data
}
