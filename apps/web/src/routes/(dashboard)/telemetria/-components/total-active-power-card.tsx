import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

interface TotalActivePowerCardProps {
  telemetryData: GetTelemetry200DataItem | undefined
  isLoading: boolean
}

export function TotalActivePowerCard({
  telemetryData,
  isLoading,
}: TotalActivePowerCardProps) {
  const total =
    (telemetryData?.potenciaAtivaFundamentalHarmonicaA ?? 0) +
    (telemetryData?.potenciaAtivaFundamentalHarmonicaB ?? 0) +
    (telemetryData?.potenciaAtivaFundamentalHarmonicaC ?? 0)

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
          value={telemetryData?.potenciaAtivaFundamentalHarmonicaA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="W"
          value={telemetryData?.potenciaAtivaFundamentalHarmonicaB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="W"
          value={telemetryData?.potenciaAtivaFundamentalHarmonicaC}
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
