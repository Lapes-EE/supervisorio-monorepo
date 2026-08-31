import z from "zod"
import { availableFields } from "../utils/field-mapping"

export const telemetryMeasurementsSchema = z
  .object(
    Object.fromEntries(availableFields.map((field) => [field, z.number()]))
  )
  .partial()

export const telemetryItemSchema = z.object({
  id: z.number().optional(),
  measurements: telemetryMeasurementsSchema.nullable(),
  message: z.string().nullable(),
  meterId: z.number(),
  status: z.enum(["success", "error"]),
  time: z.string(),
})

export const getDatabase200ResponseSchema = z.object({
  aggregation: z.string(),
  data: z.array(telemetryItemSchema),
  nullCount: z.number(),
  period: z.object({
    endDate: z.string(),
    startDate: z.string(),
  }),
  total: z.number(),
})

export type TelemetryMeasurementsSchema = z.infer<
  typeof telemetryMeasurementsSchema
>

export type TelemetryItemSchema = z.infer<typeof telemetryItemSchema>

export type GetDatabase200ResponseSchema = z.infer<
  typeof getDatabase200ResponseSchema
>
