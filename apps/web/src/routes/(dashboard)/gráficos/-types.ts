import { z } from 'zod'
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period'

export const dashboardSearchSchema = z.object({
  meterId: z.string().optional(),
  period: z.enum(GetTelemetryPeriod).catch('last_hour'),
})

export type DashboardSearchSchema = z.infer<typeof dashboardSearchSchema>

export type TelemetryDataPoint = {
  time: string
  tensaoFaseNeutroA?: number
  tensaoFaseNeutroB?: number
  tensaoFaseNeutroC?: number
  correnteA?: number
  correnteB?: number
  correnteC?: number
  potenciaAtivaFundamentalHarmonicaTotal?: number
  fpRealFaseA?: number
  fpRealFaseB?: number
  fpRealFaseC?: number
}
