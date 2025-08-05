import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import type { GetMeters200Item } from '@/http/gen/model'
import { TelemetryEditForm } from '@/routes/(dashboard)/telemetria/-components/telemetrys-edit-form'

export const Route = createFileRoute('/(dashboard)/telemetria/$meterId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { queryClient } = useRouteContext({ from: '__root__' })
  const { meterId } = Route.useParams()
  const data = queryClient.getQueryData<GetMeters200Item[]>(['Meters'])
  console.log(data)
  if (!data) {
    return
  }
  return <TelemetryEditForm meterId={meterId} meters={data} />
}
