import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Dashboard } from '../routes/(dashboard)/telemetria/$meterId'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    // biome-ignore lint/suspicious/noExplicitAny: Options can be any type here
    createFileRoute: () => (options: any) => ({
      useLoaderData: vi.fn().mockReturnValue({ data: [] }),
      useParams: vi.fn().mockReturnValue({ meterId: '1' }),
      options,
    }),
  }
})

vi.mock('@/http/gen/endpoints/lapes-api', () => ({
  getTelemetry: vi.fn().mockResolvedValue({
    data: [],
    total: 0,
    period: { startDate: '', endDate: '' },
    nullCount: 0,
    aggregation: 'raw',
  }),
}))

describe('Meter Detail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('useQuery should have refetchInterval disabled/removed (no polling)', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <Dashboard />
        </QueryClientProvider>
      )
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: Log render error in test context
      console.error('RENDER ERROR:', err)
    }

    const queries = queryClient.getQueryCache().getAll()
    expect(queries.length).toBeGreaterThan(0)

    const telemetryQuery = queries.find((q) => q.queryKey.includes('Telemetry'))
    expect(telemetryQuery).toBeDefined()
    // biome-ignore lint/suspicious/noExplicitAny: Options can be any type
    expect((telemetryQuery?.options as any).refetchInterval).toBeFalsy() // Verify polling is disabled
  })
})
