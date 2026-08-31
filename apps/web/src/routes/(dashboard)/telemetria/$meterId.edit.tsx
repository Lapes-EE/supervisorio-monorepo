import { createFileRoute } from "@tanstack/react-router"
import { TelemetryEditForm } from "@/routes/(dashboard)/telemetria/-components/telemetrys-edit-form"

export const Route = createFileRoute("/(dashboard)/telemetria/$meterId/edit")({
  component: RouteComponent,
})

function RouteComponent() {
  return <TelemetryEditForm />
}
