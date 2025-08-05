import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Label } from '@/components/ui/label'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { dayjs } from '@/lib/dayjs'
import { formatPathname } from '@/lib/format-pathname'

export const Route = createFileRoute('/(dashboard)')({
  component: RouteComponent,
})

function RouteComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const formattedPath = formatPathname(pathname)

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-row justify-between">
        <div className="flex h-5 items-center space-x-4">
          <SidebarTrigger />
          <Label className="font-bold">{formattedPath}</Label>
        </div>
        <div className="flex flex-row items-center justify-center gap-1">
          <Label>{dayjs(new Date()).format('DD/MM/YYYY HH:mm UTC Z')}</Label>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
