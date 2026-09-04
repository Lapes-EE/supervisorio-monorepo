import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, test, vi } from "vitest"
import { SensorDetailsModal } from "./sensor-details-modal"
import type { Sensor } from "./types"

const SENSOR_DESC_REGEX = /Medidor Principal/

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({
    period: "last_5_minutes",
    type: "voltage_fn",
    phase: ["A", "B", "C"],
  }),
  useRouteContext: () => ({ queryClient: new QueryClient() }),
  Link: ({ children }: { children: React.ReactNode }) => (
    <a href="#test">{children}</a>
  ),
}))

vi.mock("@/http/gen/endpoints/lapes-api", () => ({
  getTelemetry: vi.fn().mockResolvedValue({
    data: [],
    total: 0,
    period: { startDate: "", endDate: "" },
    nullCount: 0,
    aggregation: "raw",
  }),
}))

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      // Mock ResizeObserver observe
    }
    unobserve() {
      // Mock ResizeObserver unobserve
    }
    disconnect() {
      // Mock ResizeObserver disconnect
    }
  }
})

describe("SensorDetailsModal Component", () => {
  const dummySensor: Sensor = {
    id: 1,
    name: "Sensor Teste",
    description: "Medidor Principal",
    lastUpdate: "10:00:00",
    unit: "V",
    value: [220, 221, 222],
    enabled: true,
    trend: "stable",
    position: { x: 50, y: 50 },
    history: { phases: [] },
  }

  test("renders dialog content when sensor is provided without requiring queryClient or search props", () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SensorDetailsModal onClose={vi.fn()} sensor={dummySensor} />
      </QueryClientProvider>
    )

    expect(screen.getByText("Sensor Teste")).toBeDefined()
    expect(screen.getByText(SENSOR_DESC_REGEX)).toBeDefined()
    expect(screen.getByText("Histórico")).toBeDefined()
  })

  test("does not render content when sensor is null", () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <SensorDetailsModal onClose={vi.fn()} sensor={null} />
      </QueryClientProvider>
    )

    expect(screen.queryByText("Sensor Teste")).toBeNull()
  })
})
