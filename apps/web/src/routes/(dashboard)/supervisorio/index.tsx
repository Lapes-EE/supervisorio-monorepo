import { createFileRoute, Link } from '@tanstack/react-router'
import { Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import AlarmsCentral from '@/routes/(dashboard)/supervisorio/-components/alarms-central'
import { BuildingMonitor } from '@/routes/(dashboard)/supervisorio/-components/building-monitor'

export const Route = createFileRoute('/(dashboard)/supervisorio/')({
  component: Dashboard,
})

export default function Dashboard() {
  const search = Route.useSearch()
  const { queryClient } = Route.useRouteContext()
  return (
    <div className="min-h-screen">
      <div className="relative">
        <BuildingMonitor queryClient={queryClient} search={search} />
        <Button asChild className="absolute top-20 right-4" variant="outline">
          <Link search={search} to="/full-plan">
            <Maximize className="mr-2 h-4 w-4" />
            Ver em Tela Cheia
          </Link>
        </Button>
      </div>

      <Separator className="my-8" />

      <AlarmsCentral />
    </div>
  )
}
