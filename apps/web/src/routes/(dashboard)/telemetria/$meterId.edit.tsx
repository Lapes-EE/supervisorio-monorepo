import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { TelemetryEditForm } from '@/routes/(dashboard)/telemetria/-components/telemetrys-edit-form'

export const Route = createFileRoute('/(dashboard)/telemetria/$meterId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { meterId } = Route.useParams()
  const data = useLoaderData({ from: '/(dashboard)/telemetria' })
  console.log(data)
  return <TelemetryEditForm meterId={meterId} meters={data} />
}
