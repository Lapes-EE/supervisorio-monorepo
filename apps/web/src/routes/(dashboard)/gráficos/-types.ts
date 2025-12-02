import { z } from 'zod'
import { GetTelemetryPeriod } from '@/http/gen/model'

export const chartsSearchSchema = z.object({
  charts: z
    .array(
      z.object({
        meterId: z.string(),
        measurement: z.union([
          z.literal('voltage'),
          z.literal('current'),
          z.literal('power'),
          z.literal('frequency'),
          z.literal('power_factor'),
        ]),
        period: z.enum(GetTelemetryPeriod).default('last_5_minutes'),
      })
    )
    .default([]),
})

export type chartsSchema = {
  id: string
  meterId: string
  meterName: string
  measurementType: MeasurementKey
  measurementLabel: string
  color: string
  unit: string
  data: { time: string; value: number }[]
} | null

export type MeasurementKey = z.infer<
  typeof chartsSearchSchema
>['charts'][number]['measurement']
export type ChartsSearchSchema = z.infer<typeof chartsSearchSchema>
