import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { Separator } from '@/components/ui/separator'
import AlarmsCentral from '@/routes/(dashboard)/supervisorio/-components/alarms-central'
import { BuildingMonitor } from '@/routes/(dashboard)/supervisorio/-components/building-monitor'
import { toggleSearchSchema } from './-types'

export const Route = createFileRoute('/(dashboard)/supervisorio/')({
  component: Dashboard,
  validateSearch: zodValidator(toggleSearchSchema),
})

export default function Dashboard() {
  return (
    <div className="min-h-screen p-6">
      <BuildingMonitor />

      <Separator className="my-8" />

      <AlarmsCentral />
    </div>
  )
}
