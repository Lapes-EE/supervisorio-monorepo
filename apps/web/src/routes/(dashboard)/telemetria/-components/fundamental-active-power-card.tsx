import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-scada-api.gen'
import TelemetryItem from './telemetry-item'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

interface FundamentalActivePowerCardProps {
  telemetryData: TelemetryData | undefined
  isLoading: boolean
}

export function FundamentalActivePowerCard({
  telemetryData,
  isLoading,
}: FundamentalActivePowerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência ativa fundamental</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="A"
          suffix="kW"
          value={
            ((telemetryData?.potencia_ativa_fundamental_a ?? 0) +
              (telemetryData?.potencia_ativa_harmonica_a ?? 0)) /
            1000
          }
        />
        <TelemetryItem
          isLoading={isLoading}
          label="B"
          suffix="kW"
          value={(telemetryData?.potencia_ativa_fundamental_b ?? 0) / 1000}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="C"
          suffix="kW"
          value={(telemetryData?.potencia_ativa_fundamental_c ?? 0) / 1000}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma"
          suffix="kW"
          value={(telemetryData?.potencia_ativa_fundamental_total ?? 0) / 1000}
        />
      </CardContent>
    </Card>
  )
}
