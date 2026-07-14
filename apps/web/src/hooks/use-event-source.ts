import { webEnv } from '@repo/env/web'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useEventSource() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sseUrl = `${webEnv.VITE_API_URL}/sse/telemetry`
    const clientAny = queryClient as any

    if (!clientAny.__sseState) {
      const es = new EventSource(sseUrl)

      es.onopen = () => {
        console.log('[SSE] Connection established')
      }

      es.onerror = (error) => {
        console.error('[SSE] Connection error:', error)
      }

      const state = {
        es,
        listeners: new Set<(event: MessageEvent) => void>(),
        refCount: 0,
      }

      es.addEventListener('telemetry-update', (event) => {
        state.listeners.forEach((cb) => {
          try {
            cb(event)
          } catch (err) {
            console.error('[SSE] Callback execution error:', err)
          }
        })
      })

      clientAny.__sseState = state
    }

    const state = clientAny.__sseState
    state.refCount++

    const handleTelemetryUpdate = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data)
        const telemetryItems = payload.data
        if (Array.isArray(telemetryItems) && telemetryItems.length > 0) {
          const firstItem = telemetryItems[0]
          const meterId = firstItem.meterId
          if (meterId !== undefined && meterId !== null) {
            const meterIdNum = Number(meterId)
            const meterIdStr = String(meterId)

            // 1. Update the 'last_measurement' queries for this meter
            queryClient.setQueryData(
              ['Telemetry', meterIdNum, 'last_measurement'],
              payload
            )
            queryClient.setQueryData(
              ['Telemetry', meterIdStr, 'last_measurement'],
              payload
            )

            // 2. Update the historical queries for this meter
            const updateHistoricalQueries = (mId: number | string) => {
              const queries = queryClient.getQueryCache().findAll({
                queryKey: ['Telemetry', mId],
              })

              for (const query of queries) {
                const key = query.queryKey
                const period = key[2] // 'last_5_minutes', 'last_30_minutes', etc.
                if (!period || period === 'last_measurement') continue

                queryClient.setQueryData(key, (old: any) => {
                  if (!old || !Array.isArray(old.data)) return old

                  // Filter out existing items with the same ID or timestamp to avoid duplicates
                  const oldDataFiltered = old.data.filter((oldItem: any) =>
                    !telemetryItems.some(
                      (newItem: any) =>
                        newItem.id === oldItem.id || newItem.time === oldItem.time
                    )
                  )
                  const newData = [...oldDataFiltered, ...telemetryItems]

                  // Filter out items older than the period duration
                  const periodDurations: Record<string, number> = {
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

                  const duration = periodDurations[period as string]
                  if (duration) {
                    const cutoff = Date.now() - duration
                    return {
                      ...old,
                      data: newData.filter(
                        (x: any) => new Date(x.time).getTime() >= cutoff
                      ),
                    }
                  }

                  return {
                    ...old,
                    data: newData,
                  }
                })
              }
            }

            updateHistoricalQueries(meterIdNum)
            updateHistoricalQueries(meterIdStr)
          }
        }
      } catch (err) {
        console.error('[SSE] Failed to parse message event data:', err)
      }
    }

    state.listeners.add(handleTelemetryUpdate)

    return () => {
      state.listeners.delete(handleTelemetryUpdate)
      state.refCount--

      if (state.refCount <= 0) {
        state.es.close()
        delete clientAny.__sseState
        console.log('[SSE] Connection closed')
      }
    }
  }, [queryClient])
}
