import z from "zod"
import { GetTelemetryPeriod } from "@/http/gen/model/get-telemetry-period"

export const typeOption = [
  "voltage_fn",
  "voltage_ff",
  "current",
  "current_neutral",
  "power_active",
  "power_reactive",
  "power_apparent",
  "frequency",
] as const

export const toggleSearchSchema = z.object({
  type: z.enum(typeOption).default("voltage_fn"),
  period: z.enum(GetTelemetryPeriod).default("last_5_minutes"),
  phase: z.array(z.enum(["A", "B", "C"])).default(["A", "B", "C"]),
})

export type ToggleSearchSchema = z.infer<typeof toggleSearchSchema>
