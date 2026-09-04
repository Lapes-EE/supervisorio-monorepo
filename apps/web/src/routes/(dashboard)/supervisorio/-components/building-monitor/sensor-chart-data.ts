import { useQuery } from "@tanstack/react-query"
import { getTelemetry } from "@/http/gen/endpoints/lapes-api"
import type { GetTelemetryPeriod } from "@/http/gen/model/get-telemetry-period"
import type { ToggleSearchSchema } from "../../-types"
import { getAggregationConfig, getSensorHistory } from "./data"

export function useSensorChart(
  meterId: number | undefined,
  period: GetTelemetryPeriod,
  filter: ToggleSearchSchema
) {
  const { aggregation } = getAggregationConfig(period)

  const query = useQuery({
    queryKey: ["Telemetry", meterId, period],
    queryFn: () => getTelemetry({ period, meterId, aggregation }),
    refetchInterval: false,
    enabled: !!meterId,
  })

  const history = query.data
    ? getSensorHistory(query.data.data, filter)
    : undefined

  return {
    history,
    isLoading: query.isLoading,
    error: query.error,
  }
}
