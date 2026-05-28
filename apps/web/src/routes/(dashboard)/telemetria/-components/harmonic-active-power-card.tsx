import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

interface HarmonicActivePowerCardProps {
  telemetryData: GetTelemetry200DataItem | undefined
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
          value={telemetryData?.potenciaAtivaHarmonicaA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="W"
          value={telemetryData?.potenciaAtivaHarmonicaB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="W"
          value={telemetryData?.potenciaAtivaHarmonicaC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Total"
          suffix="W"
          value={telemetryData?.potenciaAtivaHarmonicaTotal}
        />
      </CardContent>
    </Card>
  )
}
