import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import { getMeters } from '@/http/gen/endpoints/lapes-scada-api.gen'
import { TelemetryForm } from './-components/telemetrys-form'
import { TelemetryList } from './-components/telemetrys-list'

export const Route = createFileRoute('/(dashboard)/telemetria')({
  component: Dashboard,
  beforeLoad: ({ context }) => {
    context.queryClient.ensureQueryData({
      queryKey: ['Meters'],
      queryFn: async () => {
        const result = await getMeters()
        return result.data
      },
    })
  },
})

function Dashboard() {
  const { data } = useQuery({
    queryKey: ['Meters'],
    queryFn: async () => {
      const result = await getMeters()
      return result.data
    },
  })

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
      <div className="grid grid-cols-3 gap-4">
        <TelemetryForm />
        {data?.map((list) => (
          <TelemetryList
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
