import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetryIp200 } from '@/http/gen/model'
import TelemetryItem from './telemetry-item'

interface PhaseNeutralVoltageCardProps {
  telemetryData: GetTelemetryIp200 | undefined
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
          value={telemetryData?.tensao_fase_neutro_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="V"
          value={telemetryData?.tensao_fase_neutro_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="V"
          value={telemetryData?.tensao_fase_neutro_c}
        />
      </CardContent>
    </Card>
  )
}
