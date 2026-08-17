import { webEnv } from '@repo/env/web'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { GetTelemetry200 } from '@/http/gen/model/get-telemetry200'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'

const PERIOD_DURATIONS: Record<string, number> = {
  last_5_minutes: 5 * 60 * 1000,
  last_30_minutes: 30 * 60 * 1000,
  last_hour: 60 * 60 * 1000,
  last_6_hours: 6 * 60 * 60 * 1000,
  last_12_hours: 12 * 60 * 60 * 1000,
  last_24_hours: 24 * 60 * 60 * 1000,
  today: 24 * 60 * 60 * 1000,
  last_7_days: 7 * 24 * 60 * 60 * 1000,
  this_month: 30 * 24 * 60 * 60 * 1000,
  last_30_days: 30 * 24 * 60 * 60 * 1000,
  this_year: 365 * 24 * 60 * 60 * 1000,
}

function mergeAndPruneItems(
  oldData: GetTelemetry200DataItem[],
  newItems: GetTelemetry200DataItem[],
  period: string
): GetTelemetry200DataItem[] {
  const oldDataFiltered = oldData.filter(
    (oldItem) =>
      !newItems.some(
        (newItem) => newItem.id === oldItem.id || newItem.time === oldItem.time
      )
  )
  const merged = [...oldDataFiltered, ...newItems]
  const duration = PERIOD_DURATIONS[period]
  if (!duration) {
    return merged
  }
  const cutoff = Date.now() - duration
  return merged.filter((item) => new Date(item.time).getTime() >= cutoff)
}

function updateHistoricalQueries(
  queryClient: QueryClient,
  telemetryItems: GetTelemetry200DataItem[],
  meterId: number | string
) {
  const queries = queryClient.getQueryCache().findAll({
    queryKey: ['Telemetry', meterId],
  })

  for (const query of queries) {
    const key = query.queryKey
    const period = typeof key[2] === 'string' ? key[2] : undefined
    if (!period || period === 'last_measurement') {
      continue
    }

    queryClient.setQueryData<GetTelemetry200>(key, (old) => {
      if (!(old && Array.isArray(old.data))) {
        return old
      }

      return {
        ...old,
        data: mergeAndPruneItems(old.data, telemetryItems, period),
      }
    })
  }
}

export function updateTelemetryCache(
  queryClient: QueryClient,
  payload: GetTelemetry200
) {
  const telemetryItems = payload.data
  if (!Array.isArray(telemetryItems) || telemetryItems.length === 0) {
    return
  }

  const firstItem = telemetryItems[0]
  const meterId = firstItem?.meterId
  if (meterId === undefined || meterId === null) {
    return
  }

  const meterIdNum = Number(meterId)
  const meterIdStr = String(meterId)

  queryClient.setQueryData(
    ['Telemetry', meterIdNum, 'last_measurement'],
    payload
  )
  queryClient.setQueryData(
    ['Telemetry', meterIdStr, 'last_measurement'],
    payload
  )

  updateHistoricalQueries(queryClient, telemetryItems, meterIdNum)
  updateHistoricalQueries(queryClient, telemetryItems, meterIdStr)
}

interface SSEState {
  es: EventSource
  listeners: Set<(event: MessageEvent) => void>
  refCount: number
}

let activeSSEState: SSEState | null = null

export function useEventSource() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sseUrl = `${webEnv.VITE_API_URL}/sse/telemetry`

    if (!activeSSEState) {
      const es = new EventSource(sseUrl)
      const state: SSEState = {
        es,
        listeners: new Set(),
        refCount: 0,
      }

      es.addEventListener('telemetry-update', (event) => {
        for (const cb of state.listeners) {
          try {
            cb(event)
          } catch {
            // Ignore callback errors
          }
        }
      })

      activeSSEState = state
    }

    const state = activeSSEState
    state.refCount++

    const handleTelemetryUpdate = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as GetTelemetry200
        updateTelemetryCache(queryClient, payload)
      } catch {
        // Ignore json parse error
      }
    }

    state.listeners.add(handleTelemetryUpdate)

    return () => {
      state.listeners.delete(handleTelemetryUpdate)
      state.refCount--

      if (state.refCount <= 0) {
        state.es.close()
        activeSSEState = null
      }
    }
  }, [queryClient])
}
