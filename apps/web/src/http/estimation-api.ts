import { webEnv } from '@repo/env/web'
import axios from 'axios'

export interface MeasurementOverride {
  meterId: number
  tensaoFaseNeutroC?: number | null
  potenciaAtivaFundamentalC?: number | null
  potenciaReativaC?: number | null
}

export interface EstimationRequest {
  overrides?: MeasurementOverride[]
}

export interface EstimationItem {
  barra: string
  ID_medidor: number
  indice_EE: number
  time: string | null
  tensao_pu: number
  tensao_V: number
  tensao_medida_V: number | null
  erro_V: number | null
}

export interface EstimationResponse {
  data: EstimationItem[]
}

export async function getEstimation(): Promise<EstimationResponse> {
  const baseURL = webEnv.VITE_ESTIMATION_API_URL ?? 'http://localhost:8000'
  const response = await axios.get<EstimationResponse>(`${baseURL}/estimation`)
  return response.data
}

export async function calculateEstimation(
  overrides: MeasurementOverride[] = []
): Promise<EstimationResponse> {
  const baseURL = webEnv.VITE_ESTIMATION_API_URL ?? 'http://localhost:8000'
  const response = await axios.post<EstimationResponse>(
    `${baseURL}/estimation`,
    { overrides }
  )
  return response.data
}
