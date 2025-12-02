import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetryIp200 } from '@/http/gen/model'
import TelemetryItem from './telemetry-item'

interface FundamentalActivePowerCardProps {
  telemetryData: GetTelemetryIp200 | undefined
  isLoading: boolean
}

export function FundamentalActivePowerCard({
  telemetryData,
  isLoading,
}: FundamentalActivePowerCardProps) {
  const total =
    (telemetryData?.potencia_ativa_fundamental_a ?? 0) +
    (telemetryData?.potencia_ativa_fundamental_b ?? 0) +
    (telemetryData?.potencia_ativa_fundamental_c ?? 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência ativa fundamental</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          suffix="W"
          value={telemetryData?.potencia_ativa_fundamental_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="W"
          value={telemetryData?.potencia_ativa_fundamental_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="W"
          value={telemetryData?.potencia_ativa_fundamental_c}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Total"
          suffix="W"
          value={total}
        />
      </CardContent>
    </Card>
  )
}
