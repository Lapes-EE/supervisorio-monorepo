import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-api.gen'
import TelemetryItem from './telemetry-item'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

interface PhasePhaseVoltageCardProps {
  telemetryData: TelemetryData | undefined
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
