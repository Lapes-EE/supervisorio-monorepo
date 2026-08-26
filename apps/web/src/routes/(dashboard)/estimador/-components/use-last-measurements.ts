import { useQuery } from '@tanstack/react-query'
import {
  calculateEstimation,
  type EstimationItem,
  getEstimation,
  type MeasurementOverride,
} from '@/http/estimation-api'
import { getMeters } from '@/http/gen/endpoints/lapes-api'
import type { LastMeasurementData } from './data'

export function useLastMeasurements(overrides: MeasurementOverride[] = []) {
  const isSimulated = overrides.length > 0

  return useQuery({
    queryKey: ['estimation', 'latest-measurements', overrides],
    queryFn: async () => {
      const [estimationResponse, meters] = await Promise.all([
        isSimulated ? calculateEstimation(overrides) : getEstimation(),
        getMeters().catch(() => []),
      ])

      const estimationItems = estimationResponse.data ?? []
      const historyByMeter = new Map<number, EstimationItem[]>()

      for (const snapshot of estimationResponse.history ?? []) {
        for (const item of snapshot.data) {
          const history = historyByMeter.get(item.ID_medidor) ?? []
          history.push(item)
          historyByMeter.set(item.ID_medidor, history)
        }
      }

      const combinedData: LastMeasurementData[] = estimationItems.map(
        (item) => {
          const meter = meters.find((m) => m.id === item.ID_medidor)
          const isOverridden = overrides.some(
            (o) => o.meterId === item.ID_medidor
          )

          return {
            id: item.ID_medidor,
            meterId: item.ID_medidor,
            name: meter?.name ?? item.barra,
            time: item.time ?? '',
            tensaoFaseNeutroA: null,
            tensaoFaseNeutroB: null,
            tensaoFaseNeutroC: item.tensao_medida_V,
            estimation: item.tensao_V,
            error: item.erro_V,
            potenciaAtivaFundamentalC: item.potencia_ativa_medida_W,
            potenciaAtivaEstimada: item.potencia_ativa_W,
            erroPotenciaAtiva: item.erro_potencia_ativa_W,
            potenciaReativaC: item.potencia_reativa_medida_VAr,
            potenciaReativaEstimada: item.potencia_reativa_VAr,
            erroPotenciaReativa: item.erro_potencia_reativa_VAr,
            history: historyByMeter.get(item.ID_medidor) ?? [item],
            isOverridden,
          }
        }
      )

      return combinedData
    },
    refetchInterval: isSimulated ? false : 60_000,
    staleTime: isSimulated ? Number.POSITIVE_INFINITY : 60_000,
    placeholderData: (previousData) => previousData,
    retry: 2,
  })
}
