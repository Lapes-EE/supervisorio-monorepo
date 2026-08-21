import { useQuery } from '@tanstack/react-query'
import { getEstimation } from '@/http/estimation-api'
import { getMeters } from '@/http/gen/endpoints/lapes-api'
import type { LastMeasurementData } from './data'

export function useLastMeasurements() {
  return useQuery({
    queryKey: ['estimation', 'latest-measurements'],
    queryFn: async () => {
      const [estimationResponse, meters] = await Promise.all([
        getEstimation(),
        getMeters().catch(() => []),
      ])

      const estimationItems = estimationResponse.data ?? []

      const combinedData: LastMeasurementData[] = estimationItems.map(
        (item) => {
          const meter = meters.find((m) => m.id === item.ID_medidor)

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
          }
        }
      )

      return combinedData
    },
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
    retry: 2,
  })
}
