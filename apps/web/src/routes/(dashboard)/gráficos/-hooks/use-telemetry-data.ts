import { queryOptions, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getTelemetry } from '@/http/gen/endpoints/lapes-api.gen'
import type { GetTelemetryAggregation } from '@/http/gen/model/get-telemetry-aggregation.gen'
import type { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period.gen'
import type { GetTelemetry200 } from '@/http/gen/model/get-telemetry200.gen'
import { telemetryKeys } from '@/lib/query-keys'

export const telemetryQueries = {
  byParams: (params: {
    meterId: number
    period: GetTelemetryPeriod
    aggregation: GetTelemetryAggregation
  }) =>
    queryOptions({
      queryKey: telemetryKeys.byMeterId(params.meterId, params.period),
      queryFn: async () => {
        const result = await getTelemetry({
          meterId: params.meterId,
          period: params.period,
          aggregation: params.aggregation,
        })
        return result
      },
      staleTime: 30 * 1000,
    }),
}

export function useTelemetryData(
  meterId: number | undefined,
  period: GetTelemetryPeriod | undefined,
  aggregation: GetTelemetryAggregation | undefined
) {
  const params = { meterId, period, aggregation } as {
    meterId: number
    period: GetTelemetryPeriod
    aggregation: GetTelemetryAggregation
  }
  const query = useQuery({
    ...telemetryQueries.byParams(params),
    enabled: !!meterId && !!period && !!aggregation,
    select: useMemo(() => (data: GetTelemetry200) => data?.data ?? [], []),
  })

  return query
}
