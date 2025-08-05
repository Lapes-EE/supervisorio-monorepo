import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboard)/telemetria/')({
  component: RouteComponent,
})

function RouteComponent() {
  return null
}
