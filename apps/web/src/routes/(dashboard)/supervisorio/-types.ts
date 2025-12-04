import z from 'zod'
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period.gen'

export const typeOption = ['voltage', 'power', 'current', 'frequency'] as const

export const toggleSearchSchema = z.object({
  type: z.enum(typeOption).default('voltage'),
  period: z.enum(GetTelemetryPeriod).default('last_5_minutes'),
  phase: z.array(z.enum(['A', 'B', 'C'])).default(['A', 'B', 'C']),
})

export type ToggleSearchSchema = z.infer<typeof toggleSearchSchema>
