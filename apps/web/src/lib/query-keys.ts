import { queryOptions } from "@tanstack/react-query"
import { getMeters, getTelemetry } from "@/http/gen/endpoints/lapes-api"
import type { GetTelemetryParams } from "@/http/gen/model/get-telemetry-params"

export const meterKeys = {
  all: ["meters"] as const,
  byType: (type: string) => [...meterKeys.all, type] as const,
  detail: (id: number) => [...meterKeys.details(), id] as const,
  details: () => [...meterKeys.all, "detail"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...meterKeys.lists(), filters] as const,
  lists: () => [...meterKeys.all, "list"] as const,
}

export const meterQueries = {
  all: () =>
    queryOptions({
      queryFn: async () => await getMeters(),
      queryKey: meterKeys.all,
      staleTime: 5 * 60 * 1000,
    }),
}

export const telemetryKeys = {
  all: ["telemetry"] as const,
  byMeterId: (meterId: number, period?: string) =>
    [...telemetryKeys.all, "meterId", meterId, period] as const,
  byParams: (params?: GetTelemetryParams) =>
    [...telemetryKeys.all, params] as const,
}

export const telemetryQueries = {
  byParams: (params?: GetTelemetryParams) =>
    queryOptions({
      queryFn: async () => await getTelemetry(params),
      queryKey: telemetryKeys.byParams(params),
      staleTime: 30 * 1000,
    }),
}

export const sessionKeys = {
  all: ["session"] as const,
  password: () => [...sessionKeys.all, "password"] as const,
}

export const sensorKeys = {
  all: ["sensors"] as const,
  byType: (type: string) => [...sensorKeys.all, type] as const,
}

export const mutationKeys = {
  deleteMeters: ["deleteMeters"] as const,
  patchMeter: ["patchMeter"] as const,
  postMeters: ["postMeters"] as const,
  postSession: ["postSession"] as const,
  putMeters: ["putMeters"] as const,
}
