import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetryIp200 } from '@/http/gen/model'
import TelemetryItem from './telemetry-item'

interface PhaseAngleCardProps {
  telemetryData: GetTelemetryIp200 | undefined
  isLoading: boolean
}

export function PhaseAngleCard({
  telemetryData,
  isLoading,
}: PhaseAngleCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Ângulo de fase</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row justify-between space-y-2">
        <div>
          <TelemetryItem
            isLoading={isLoading}
            label="A"
            suffix="°"
            value={telemetryData?.angulo_fase_a}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="B"
            suffix="°"
            value={telemetryData?.angulo_fase_b}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="C"
            suffix="°"
            value={telemetryData?.angulo_fase_c}
          />
        </div>
        <div>
          <TelemetryItem
            isLoading={isLoading}
            label="A"
            value={telemetryData?.phi_fase_a}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="B"
            value={telemetryData?.phi_fase_b}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="C"
            value={telemetryData?.phi_fase_c}
          />
        </div>
      </CardContent>
    </Card>
  )
}
