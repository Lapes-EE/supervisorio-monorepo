import z from 'zod'
import type { EstimationItem } from '@/http/estimation-api'
import { GetTelemetryFieldsAnyOfItem } from '@/http/gen/model/get-telemetry-fields-any-of-item'

export const measureTypeSchema = z.object({
  type: z
    .enum(['potencia_ativa', 'tensao', 'potencia_reativa'])
    .default('tensao'),
})

export type MeasureTypeSearch = z.infer<typeof measureTypeSchema>

export type EstimatedValueKey =
  | 'estimation'
  | 'potenciaAtivaEstimada'
  | 'potenciaReativaEstimada'

export type MeasuredValueKey =
  | 'tensaoFaseNeutroC'
  | 'potenciaAtivaFundamentalC'
  | 'potenciaReativaC'

export type ErrorValueKey =
  | 'error'
  | 'erroPotenciaAtiva'
  | 'erroPotenciaReativa'

export interface MeasureConfig {
  field: GetTelemetryFieldsAnyOfItem
  measuredKey: MeasuredValueKey
  estimatedKey: EstimatedValueKey
  errorKey: ErrorValueKey
  measuredApiKey: keyof Pick<
    EstimationItem,
    | 'tensao_medida_V'
    | 'potencia_ativa_medida_W'
    | 'potencia_reativa_medida_VAr'
  >
  estimatedApiKey: keyof Pick<
    EstimationItem,
    'tensao_V' | 'potencia_ativa_W' | 'potencia_reativa_VAr'
  >
  errorApiKey: keyof Pick<
    EstimationItem,
    'erro_V' | 'erro_potencia_ativa_W' | 'erro_potencia_reativa_VAr'
  >
  unit: string
  label: string
}

export const MEASURE_CONFIG: Record<MeasureTypeSearch['type'], MeasureConfig> =
  {
    tensao: {
      field: GetTelemetryFieldsAnyOfItem.tensaoFaseNeutroC,
      measuredKey: 'tensaoFaseNeutroC',
      estimatedKey: 'estimation',
      errorKey: 'error',
      measuredApiKey: 'tensao_medida_V',
      estimatedApiKey: 'tensao_V',
      errorApiKey: 'erro_V',
      unit: 'V',
      label: 'Tensão',
    },
    potencia_ativa: {
      field: GetTelemetryFieldsAnyOfItem.potenciaAtivaFundamentalC,
      measuredKey: 'potenciaAtivaFundamentalC',
      estimatedKey: 'potenciaAtivaEstimada',
      errorKey: 'erroPotenciaAtiva',
      measuredApiKey: 'potencia_ativa_medida_W',
      estimatedApiKey: 'potencia_ativa_W',
      errorApiKey: 'erro_potencia_ativa_W',
      unit: 'W',
      label: 'Potência Ativa',
    },
    potencia_reativa: {
      field: GetTelemetryFieldsAnyOfItem.potenciaReativaC,
      measuredKey: 'potenciaReativaC',
      estimatedKey: 'potenciaReativaEstimada',
      errorKey: 'erroPotenciaReativa',
      measuredApiKey: 'potencia_reativa_medida_VAr',
      estimatedApiKey: 'potencia_reativa_VAr',
      errorApiKey: 'erro_potencia_reativa_VAr',
      unit: 'VAr',
      label: 'Potência Reativa',
    },
  }
