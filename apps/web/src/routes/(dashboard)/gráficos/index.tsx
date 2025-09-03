import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboard)/gráficos/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(dashboard)/charts/"!</div>
}
