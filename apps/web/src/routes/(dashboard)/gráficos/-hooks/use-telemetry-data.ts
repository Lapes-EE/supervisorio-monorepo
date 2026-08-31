import { queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { getTelemetry } from "@/http/gen/endpoints/lapes-api"
import type { GetTelemetryPeriod } from "@/http/gen/model/get-telemetry-period"
import type { GetTelemetry200 } from "@/http/gen/model/get-telemetry200"
import { telemetryKeys } from "@/lib/query-keys"

export const telemetryQueries = {
  byParams: (params: { meterId: number; period: GetTelemetryPeriod }) =>
    queryOptions({
      queryKey: telemetryKeys.byMeterId(params.meterId, params.period),
      queryFn: async () =>
        await getTelemetry({
          meterId: params.meterId,
          period: params.period,
        }),
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
    select: useMemo(() => (data: GetTelemetry200) => data.data, []),
  })

  return query
}
