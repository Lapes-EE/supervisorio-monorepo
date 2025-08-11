import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-api.gen'
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
  const total =
    (telemetryData?.potencia_ativa_fundamental_harmonica_a ?? 0) +
    (telemetryData?.potencia_ativa_fundamental_harmonica_b ?? 0) +
    (telemetryData?.potencia_ativa_fundamental_harmonica_c ?? 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência ativa fundamental + harmônica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          suffix="W"
          value={telemetryData?.potencia_ativa_fundamental_harmonica_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="W"
          value={telemetryData?.potencia_ativa_fundamental_harmonica_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="W"
          value={telemetryData?.potencia_ativa_fundamental_harmonica_c}
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
