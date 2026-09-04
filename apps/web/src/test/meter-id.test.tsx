import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { Dashboard } from "../routes/(dashboard)/telemetria/$meterId"

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({
      options,
      useLoaderData: vi.fn().mockReturnValue({ data: [] }),
      useParams: vi.fn().mockReturnValue({ meterId: "1" }),
    }),
    useMatches: vi
      .fn()
      .mockReturnValue([{ id: "/(dashboard)/telemetria/$meterId" }]),
  }
})

vi.mock("@/http/gen/endpoints/lapes-api", () => ({
  getTelemetry: vi.fn().mockResolvedValue({
    aggregation: "raw",
    data: [],
    nullCount: 0,
    period: { endDate: "", startDate: "" },
    total: 0,
  }),
}))

describe("Meter Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("useQuery should have refetchInterval disabled/removed (no polling)", () => {
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
    } catch {
      // Ignore router render error outside of RouterProvider
    }

    const queries = queryClient.getQueryCache().getAll()
    expect(queries.length).toBeGreaterThan(0)

    const telemetryQuery = queries.find((q) => q.queryKey.includes("Telemetry"))
    expect(telemetryQuery).toBeDefined()
    expect(
      (telemetryQuery?.options as { refetchInterval?: unknown } | undefined)
        ?.refetchInterval
    ).toBeFalsy() // Verify polling is disabled
  })
})
