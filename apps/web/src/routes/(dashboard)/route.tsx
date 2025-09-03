import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
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

  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-row justify-between">
        <div className="flex h-5 items-center space-x-4">
          <Label className="font-bold">{formattedPath}</Label>
        </div>
        <div className="flex flex-row items-center justify-center gap-1">
          <Label>{dayjs(now).format('DD/MM/YYYY HH:mm:ss UTC Z')}</Label>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
