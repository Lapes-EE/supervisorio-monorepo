import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router"
import type { GetMeters200Item } from "@/http/gen/model/get-meters200-item"
import { TelemetryForm } from "./-components/telemetrys-form"
import { TelemetryList } from "./-components/telemetrys-list"

export const Route = createFileRoute("/(dashboard)/telemetria")({
  component: Dashboard,
  loader: ({ context }) => {
    const response: GetMeters200Item[] = context.meters
    return { data: response }
  },
})

function Dashboard() {
  const { data } = Route.useLoaderData()
  const matches = useMatches()
  const leafRouteId = matches.at(-1)?.id

  const isExactMeterIdDetail =
    leafRouteId === "/(dashboard)/telemetria/$meterId"

  if (isExactMeterIdDetail) {
    return <Outlet />
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <TelemetryForm />
        {data?.map((list) => (
          <TelemetryList
            description={list.description}
            enabled={list.enabled}
            health={list.health}
            id={list.id}
            ip={list.ip}
            issoSerial={list.issoSerial}
            key={list.id}
            name={list.name}
          />
        ))}
      </div>
      <Outlet />
    </>
  )
}
