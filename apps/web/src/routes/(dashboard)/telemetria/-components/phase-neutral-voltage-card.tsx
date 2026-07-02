import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

interface PhaseNeutralVoltageCardProps {
  telemetryData: GetTelemetry200DataItem | undefined
  isLoading: boolean
}

export function PhaseNeutralVoltageCard({
  telemetryData,
  isLoading,
}: PhaseNeutralVoltageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tensão fase-neutro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          suffix="V"
          value={telemetryData?.measurements?.tensaoFaseNeutroA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="V"
          value={telemetryData?.measurements?.tensaoFaseNeutroB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="V"
          value={telemetryData?.measurements?.tensaoFaseNeutroC}
        />
      </CardContent>
    </Card>
  )
}
