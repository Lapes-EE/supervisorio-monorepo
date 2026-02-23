import { queryOptions } from '@tanstack/react-query'
import {
  getMeters,
  getTelemetry,
  getTelemetryIp,
} from '@/http/gen/endpoints/lapes-api.gen'
import type { GetTelemetryParams } from '@/http/gen/model/get-telemetry-params.gen'

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
      queryFn: () => getMeters(),
      staleTime: 5 * 60 * 1000,
    }),
}

export const telemetryKeys = {
  all: ['telemetry'] as const,
  byIp: (ip: string) => [...telemetryKeys.all, 'ip', ip] as const,
  byParams: (params?: GetTelemetryParams) =>
    [...telemetryKeys.all, params] as const,
}

export const telemetryQueries = {
  byIp: (ip: string) =>
    queryOptions({
      queryKey: telemetryKeys.byIp(ip),
      queryFn: () => getTelemetryIp(ip),
      enabled: !!ip,
      staleTime: 30 * 1000,
    }),
  byParams: (params?: GetTelemetryParams) =>
    queryOptions({
      queryKey: telemetryKeys.byParams(params),
      queryFn: () => getTelemetry(params),
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
