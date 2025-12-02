import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetryIp200 } from '@/http/gen/model'
import TelemetryItem from './telemetry-item'

interface PhasePhaseVoltageCardProps {
  telemetryData: GetTelemetryIp200 | undefined
  isLoading: boolean
}

export function PhasePhaseVoltageCard({
  telemetryData,
  isLoading,
}: PhasePhaseVoltageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tensão fase-fase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A-B"
          suffix="V"
          value={telemetryData?.tensao_fase_fase_ab}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B-C"
          suffix="V"
          value={telemetryData?.tensao_fase_fase_bc}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C-A"
          suffix="V"
          value={telemetryData?.tensao_fase_fase_ca}
        />
      </CardContent>
    </Card>
  )
}
