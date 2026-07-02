import { webEnv } from '@repo/env/web'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { sources } from 'eventsourcemock'
import type React from 'react'
import { describe, expect, test } from 'vitest'
import { useEventSource } from './use-event-source'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

describe('useEventSource Hook', () => {
  test('should initialize EventSource with correct URL and close it on unmount', () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { unmount } = renderHook(() => useEventSource(), { wrapper })

    const expectedUrl = `${webEnv.VITE_API_URL}/sse/telemetry`
    const mockConnection = sources[expectedUrl]

    expect(mockConnection).toBeDefined()
    expect(mockConnection.readyState).toBe(0) // CONNECTING

    unmount()
    expect(mockConnection.readyState).toBe(2) // CLOSED
  })

  test('should update cache for both string and numeric query keys on telemetry-update', () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useEventSource(), { wrapper })

    const expectedUrl = `${webEnv.VITE_API_URL}/sse/telemetry`
    const mockConnection = sources[expectedUrl]

    const mockPayload = {
      meterId: 4,
      data: {
        data: [
          {
            id: 10,
            meterId: 4,
            time: '2026-07-02T20:00:00Z',
            status: 'success',
            measurements: {
              tensaoFaseNeutroA: 220,
            },
          },
        ],
      },
    }

    // Emit the custom event
    mockConnection.emit('telemetry-update', {
      data: JSON.stringify(mockPayload),
    })

    // Assert cache values
    const numericCached = queryClient.getQueryData([
      'Telemetry',
      4,
      'last_measurement',
    ])
    const stringCached = queryClient.getQueryData([
      'Telemetry',
      '4',
      'last_measurement',
    ])

    expect(numericCached).toEqual(mockPayload.data)
    expect(stringCached).toEqual(mockPayload.data)
  })
})
