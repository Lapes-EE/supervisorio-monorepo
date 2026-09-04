import { z } from "zod"
import { GetTelemetryPeriod } from "@/http/gen/model/get-telemetry-period"

export const dashboardSearchSchema = z.object({
  meterId: z.string().optional(),
  period: z.enum(GetTelemetryPeriod).catch("last_hour"),
})

export type DashboardSearchSchema = z.infer<typeof dashboardSearchSchema>

export interface TelemetryDataPoint {
  correnteA?: number
  correnteB?: number
  correnteC?: number
  fpRealFaseA?: number
  fpRealFaseB?: number
  fpRealFaseC?: number
  potenciaAtivaFundamentalHarmonicaTotal?: number
  tensaoFaseNeutroA?: number
  tensaoFaseNeutroB?: number
  tensaoFaseNeutroC?: number
  time: string
}
