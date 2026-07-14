import z from 'zod'
import { availableFields } from '../utils/field-mapping'

export const telemetryMeasurementsSchema = z
  .object(
    Object.fromEntries(availableFields.map((field) => [field, z.number()]))
  )
  .partial()

export const telemetryItemSchema = z.object({
  id: z.number().optional(),
  meterId: z.number(),
  time: z.string(),
  status: z.enum(['success', 'error']),
  message: z.string().nullable(),
  measurements: telemetryMeasurementsSchema.nullable(),
})

export const getDatabase200ResponseSchema = z.object({
  data: z.array(telemetryItemSchema),
  total: z.number(),
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  nullCount: z.number(),
  aggregation: z.string(),
})

export type TelemetryMeasurementsSchema = z.infer<
  typeof telemetryMeasurementsSchema
>

export type TelemetryItemSchema = z.infer<typeof telemetryItemSchema>

export type GetDatabase200ResponseSchema = z.infer<
  typeof getDatabase200ResponseSchema
>
