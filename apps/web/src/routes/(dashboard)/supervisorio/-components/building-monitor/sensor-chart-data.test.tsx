import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type React from "react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { getTelemetry } from "@/http/gen/endpoints/lapes-api"
import type { ToggleSearchSchema } from "../../-types"
import { useSensorChart } from "./sensor-chart-data"

vi.mock("@/http/gen/endpoints/lapes-api", () => ({
  getTelemetry: vi.fn(),
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

describe("useSensorChart Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("calls getTelemetry with correct parameters when enabled", async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const mockData = {
      data: [
        {
          id: 1,
          meterId: 1,
          time: "2026-07-02T20:00:00Z",
          status: "success",
          measurements: {
            tensaoFaseNeutroA: 220,
            tensaoFaseNeutroB: 221,
            tensaoFaseNeutroC: 222,
          },
        },
      ],
      total: 1,
      period: {
        startDate: "2026-07-02T20:00:00Z",
        endDate: "2026-07-02T20:00:00Z",
      },
      nullCount: 0,
      aggregation: "raw",
    }

    vi.mocked(getTelemetry).mockResolvedValue(
      mockData as unknown as Parameters<
        typeof vi.mocked<typeof getTelemetry>
      >[0] extends (...args: never[]) => Promise<infer R>
        ? R
        : never
    )

    const filter = { type: "voltage" } as unknown as ToggleSearchSchema

    const { result } = renderHook(
      () => useSensorChart(1, "last_5_minutes", filter),
      {
        wrapper,
      }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(getTelemetry).toHaveBeenCalledWith({
      period: "last_5_minutes",
      meterId: 1,
      aggregation: "raw",
    })

    expect(result.current.history).toEqual({
      phases: [
        {
          time: "2026-07-02T20:00:00Z",
          phaseA: 220,
          phaseB: 221,
          phaseC: 222,
        },
      ],
    })
  })

  test("is disabled when meterId is undefined", () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const filter = { type: "voltage" } as unknown as ToggleSearchSchema

    const { result } = renderHook(
      () => useSensorChart(undefined, "last_5_minutes", filter),
      {
        wrapper,
      }
    )

    expect(getTelemetry).not.toHaveBeenCalled()
    expect(result.current.history).toBeUndefined()
  })
})
