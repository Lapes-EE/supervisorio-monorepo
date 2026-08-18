import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import AlarmsCentral from '@/routes/(dashboard)/supervisorio/-components/alarms-central'
import { BuildingMonitor } from '@/routes/(dashboard)/supervisorio/-components/building-monitor'

export const Route = createFileRoute('/(dashboard)/supervisorio/')({
  component: Dashboard,
})

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <div className="relative">
        <BuildingMonitor />
      </div>

      <Separator className="my-8" />

      <AlarmsCentral />
    </div>
  )
}
