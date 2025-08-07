import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-scada-api.gen'
import TelemetryItem from './telemetry-item'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

interface HarmonicActivePowerCardProps {
  telemetryData: TelemetryData | undefined
  isLoading: boolean
}

export function HarmonicActivePowerCard({
  telemetryData,
  isLoading,
}: HarmonicActivePowerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência ativa harmônica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          suffix="W"
          value={telemetryData?.potencia_ativa_harmonica_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="W"
          value={telemetryData?.potencia_ativa_harmonica_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="W"
          value={telemetryData?.potencia_ativa_harmonica_c}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Total"
          suffix="W"
          value={telemetryData?.potencia_ativa_harmonica_total}
        />
      </CardContent>
    </Card>
  )
}
