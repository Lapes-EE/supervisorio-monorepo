import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-scada-api.gen'
import TelemetryItem from './telemetry-item'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

interface PhaseNeutralVoltageCardProps {
  telemetryData: TelemetryData | undefined
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
