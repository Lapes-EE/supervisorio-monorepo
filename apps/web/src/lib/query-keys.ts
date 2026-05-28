import { queryOptions } from '@tanstack/react-query'
import { getMeters, getTelemetry } from '@/http/gen/endpoints/lapes-api'
import type { GetTelemetryParams } from '@/http/gen/model/get-telemetry-params'

export const meterKeys = {
  all: ['meters'] as const,
  lists: () => [...meterKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...meterKeys.lists(), filters] as const,
  details: () => [...meterKeys.all, 'detail'] as const,
  detail: (id: number) => [...meterKeys.details(), id] as const,
  byType: (type: string) => [...meterKeys.all, type] as const,
}

export const meterQueries = {
  all: () =>
    queryOptions({
      queryKey: meterKeys.all,
      queryFn: async () => {
        const response = await getMeters()
        return response.data
      },
      staleTime: 5 * 60 * 1000,
    }),
}

export const telemetryKeys = {
  all: ['telemetry'] as const,
  byParams: (params?: GetTelemetryParams) =>
    [...telemetryKeys.all, params] as const,
  byMeterId: (meterId: number, period?: string) =>
    [...telemetryKeys.all, 'meterId', meterId, period] as const,
}

export const telemetryQueries = {
  byParams: (params?: GetTelemetryParams) =>
    queryOptions({
      queryKey: telemetryKeys.byParams(params),
      queryFn: async () => {
        const response = await getTelemetry(params)
        return response.data
      },
      staleTime: 30 * 1000,
    }),
}

export const sessionKeys = {
  all: ['session'] as const,
  password: () => [...sessionKeys.all, 'password'] as const,
}

export const sensorKeys = {
  all: ['sensors'] as const,
  byType: (type: string) => [...sensorKeys.all, type] as const,
}

export const mutationKeys = {
  postMeters: ['postMeters'] as const,
  putMeters: ['putMeters'] as const,
  deleteMeters: ['deleteMeters'] as const,
  patchMeter: ['patchMeter'] as const,
  postSession: ['postSession'] as const,
}
