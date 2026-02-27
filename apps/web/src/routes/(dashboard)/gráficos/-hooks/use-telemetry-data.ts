import { queryOptions, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getTelemetry } from '@/http/gen/endpoints/lapes-api.gen'
import type { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period.gen'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item.gen'
import { telemetryKeys } from '@/lib/query-keys'

export const telemetryQueries = {
  byParams: (params: { meterId: number; period: GetTelemetryPeriod }) =>
    queryOptions({
      queryKey: telemetryKeys.byMeterId(params.meterId, params.period),
      queryFn: async () => {
        const result = await getTelemetry({
          meterId: params.meterId,
          period: params.period,
        })
        return result.data
      },
      staleTime: 30 * 1000,
    }),
}

export function useTelemetryData(
  meterId: number | undefined,
  period: GetTelemetryPeriod | undefined
) {
  const params = { meterId, period } as {
    meterId: number
    period: GetTelemetryPeriod
  }
  const query = useQuery({
    ...telemetryQueries.byParams(params),
    enabled: !!meterId && !!period,
    select: useMemo(
      () => (data: { data: GetTelemetry200DataItem[] }) => data?.data ?? [],
      []
    ),
  })

  return query
}
