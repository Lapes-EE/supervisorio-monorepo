import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import { TelemetryForm } from './-components/telemetrys-form'
import { TelemetryList } from './-components/telemetrys-list'

export const Route = createFileRoute('/(dashboard)/telemetria')({
  component: Dashboard,
  loader: ({ context }) => {
    const response = context.meters
    return { data: response }
  },
})

function Dashboard() {
  const { data } = Route.useLoaderData()

  const matchRoute = useMatchRoute()

  const isTelemetryIpRoute = matchRoute({
    to: '/telemetria/$telemetryIp',
    fuzzy: false,
  })

  if (isTelemetryIpRoute) {
    return <Outlet />
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <TelemetryForm />
        {data?.map((list) => (
          <TelemetryList
            active={list.active}
            description={list.description}
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
