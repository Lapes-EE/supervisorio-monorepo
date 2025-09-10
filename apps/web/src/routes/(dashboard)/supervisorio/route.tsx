import { createFileRoute, Outlet } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { toggleSearchSchema } from './-types'

export const Route = createFileRoute('/(dashboard)/supervisorio')({
  validateSearch: zodValidator(toggleSearchSchema),
  component: SupervisorioLayout,
})

function SupervisorioLayout() {
  return <Outlet />
}
