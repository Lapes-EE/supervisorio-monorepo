import { z } from "zod"
import { availableFields } from "./field-mapping"

export const telemetryQuerySchema = z.object({
  aggregation: z
    .enum([
      "raw",
      "30 seconds",
      "1 minute",
      "2 minute",
      "5 minute",
      "10 minute",
      "20 minute",
      "30 minute",
      "1 hour",
      "3 hours",
      "1 day",
    ])
    .default("raw"),
  endDate: z.iso.datetime().optional(),
  fields: z
    .string()
    .regex(
      /^\[.*\]$/,
      'Formato inválido. Use array JSON, ex: ["campo1","campo2"]'
    )
    .optional()
    .describe(
      'Campos específicos para retornar (ex: ["correnteA","correnteB"])'
    )
    .transform((val) => {
      if (!val) {
        return
      }
      return JSON.parse(val)
    })
    .pipe(z.array(z.enum(availableFields)))
    .optional(),
  meterId: z.coerce.number().int().positive().optional(),
  period: z
    .enum([
      "last_measurement",
      "last_5_minutes",
      "last_30_minutes",
      "last_hour",
      "last_6_hours",
      "last_12_hours",
      "last_24_hours",
      "today",
      "last_7_days",
      "this_month",
      "last_30_days",
      "this_year",
      "last_measurement",
    ])
    .optional(),
  startDate: z.iso.datetime().optional(),
})

export type TelemetryQuerySchema = z.infer<typeof telemetryQuerySchema>
export type PeriodType = TelemetryQuerySchema["period"]
