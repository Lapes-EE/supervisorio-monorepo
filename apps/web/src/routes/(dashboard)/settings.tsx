import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboard)/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/settings"!</div>
}
