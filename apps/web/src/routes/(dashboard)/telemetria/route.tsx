import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import { getMeters } from '@/http/gen/endpoints/lapes-api.gen'
import { TelemetryForm } from './-components/telemetrys-form'
import { TelemetryList } from './-components/telemetrys-list'

export const Route = createFileRoute('/(dashboard)/telemetria')({
  component: Dashboard,
  loader: async () => {
    const response = await getMeters()
    return response.data
  },
})

function Dashboard() {
  const data = Route.useLoaderData()
  console.log(data)

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
            key={list.id}
            name={list.name}
          />
        ))}
      </div>
      <Outlet />
    </>
  )
}
