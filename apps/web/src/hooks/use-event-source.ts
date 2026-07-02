import { webEnv } from '@repo/env/web'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useEventSource() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sseUrl = `${webEnv.VITE_API_URL}/sse/telemetry`
    const es = new EventSource(sseUrl)

    es.onopen = () => {
      console.log('[SSE] Connection established')
    }

    es.onerror = (error) => {
      console.error('[SSE] Connection error:', error)
    }

    const handleTelemetryUpdate = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data)
        const { meterId, data } = payload
        if (meterId !== undefined && data !== undefined) {
          // Update cache for both numeric and string keys to prevent navigation mismatch
          queryClient.setQueryData(
            ['Telemetry', Number(meterId), 'last_measurement'],
            data
          )
          queryClient.setQueryData(
            ['Telemetry', String(meterId), 'last_measurement'],
            data
          )
        }
      } catch (err) {
        console.error('[SSE] Failed to parse message event data:', err)
      }
    }

    es.addEventListener('telemetry-update', handleTelemetryUpdate)

    return () => {
      es.removeEventListener('telemetry-update', handleTelemetryUpdate)
      es.close()
      console.log('[SSE] Connection closed')
    }
  }, [queryClient])
}
