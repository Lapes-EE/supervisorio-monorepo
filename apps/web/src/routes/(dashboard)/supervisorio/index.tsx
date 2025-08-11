import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import z from 'zod'
import { Separator } from '@/components/ui/separator'
import { GetTelemetryPeriod } from '@/http/gen/model'
import AlarmsCentral from '@/routes/(dashboard)/supervisorio/-components/alarms-central'
import { BuildingMonitor } from '@/routes/(dashboard)/supervisorio/-components/building-monitor'

const toggleSearchSchema = z.object({
  type: z.enum(['voltage', 'power', 'current', 'frequency']).default('voltage'),
  period: z.enum(GetTelemetryPeriod).default('last_5_minutes'),
})

export type ToggleSearchSchema = z.infer<typeof toggleSearchSchema>

export const Route = createFileRoute('/(dashboard)/supervisorio/')({
  component: Dashboard,
  validateSearch: zodValidator(toggleSearchSchema),
})

function Dashboard() {
  return (
    <div className="min-h-screen p-6">
      <BuildingMonitor />

      <Separator className="my-8" />

      <AlarmsCentral />
    </div>
  )
}

export default Dashboard
