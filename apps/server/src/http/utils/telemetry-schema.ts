import { z } from 'zod'
import { availableFields } from './field-mapping'

export const telemetryQuerySchema = z.object({
  meterId: z.coerce.number().int().positive().optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  period: z
    .enum([
      'last_5_minutes',
      'last_30_minutes',
      'last_hour',
      'last_6_hours',
      'last_12_hours',
      'last_24_hours',
      'today',
      'last_7_days',
      'this_month',
      'last_30_days',
      'this_year',
    ])
    .optional(),
  aggregation: z
    .enum([
      'raw',
      '30 seconds',
      '1 minute',
      '2 minute',
      '5 minute',
      '10 minute',
      '20 minute',
      '30 minute',
      '1 hour',
      '3 hours',
      '1 day',
    ])
    .default('raw'),
  fields: z
    .union([z.string(), z.array(z.enum(availableFields))])
    .transform((val) => (typeof val === 'string' ? [val] : val))
    .pipe(z.array(z.enum(availableFields)))
    .optional()
    .describe(
      'Campos específicos para retornar. Se não informado, retorna todos.'
    ),
})

export type TelemetryQuerySchema = z.infer<typeof telemetryQuerySchema>
export type PeriodType = TelemetryQuerySchema['period']
