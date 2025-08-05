import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-scada-api.gen'
import TelemetryItem from './telemetry-item'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

interface TotalActivePowerCardProps {
  telemetryData: TelemetryData | undefined
  isLoading: boolean
}

export function TotalActivePowerCard({
  telemetryData,
  isLoading,
}: TotalActivePowerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência ativa total</CardTitle>
        <CardDescription>Fundamental + Harmônica</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="A"
          suffix="kW"
          value={
            ((telemetryData?.potencia_ativa_fundamental_harmonica_a ?? 0) +
              (telemetryData?.potencia_ativa_harmonica_a ?? 0)) /
            1000
          }
        />
        <TelemetryItem
          isLoading={isLoading}
          label="B"
          suffix="kW"
          value={
            (telemetryData?.potencia_ativa_fundamental_harmonica_b ?? 0) / 1000
          }
        />
        <TelemetryItem
          isLoading={isLoading}
          label="C"
          suffix="kW"
          value={
            (telemetryData?.potencia_ativa_fundamental_harmonica_c ?? 0) / 1000
          }
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma"
          value={telemetryData?.potencia_ativa_fundamental_harmonica_total ?? 0}
        />
      </CardContent>
    </Card>
  )
}
