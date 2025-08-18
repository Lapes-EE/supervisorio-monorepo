import z from 'zod'
import { GetTelemetryPeriod } from '@/http/gen/model'

export const toggleSearchSchema = z.object({
  type: z.enum(['voltage', 'power', 'current', 'frequency']).default('voltage'),
  period: z.enum(GetTelemetryPeriod).default('last_5_minutes'),
  phase: z.array(z.enum(['A', 'B', 'C'])).default(['A', 'B', 'C']),
})

export type ToggleSearchSchema = z.infer<typeof toggleSearchSchema>
