import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetryIp200 } from '@/http/gen/model/get-telemetry-ip200.gen'
import TelemetryItem from './telemetry-item'

interface HarmonicActivePowerCardProps {
  telemetryData: GetTelemetryIp200 | undefined
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
