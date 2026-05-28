import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

interface PhaseAngleCardProps {
  telemetryData: GetTelemetry200DataItem | undefined
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
            label="Ângulo Fase A"
            suffix="°"
            value={telemetryData?.anguloFaseA}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="Ângulo Fase B"
            suffix="°"
            value={telemetryData?.anguloFaseB}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="Ângulo Fase C"
            suffix="°"
            value={telemetryData?.anguloFaseC}
          />
        </div>
        <div>
          <TelemetryItem
            isLoading={isLoading}
            label="Phi Fase A"
            suffix="°"
            value={telemetryData?.phiFaseA}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="Phi Fase B"
            suffix="°"
            value={telemetryData?.phiFaseB}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="Phi Fase C"
            suffix="°"
            value={telemetryData?.phiFaseC}
          />
        </div>
      </CardContent>
    </Card>
  )
}
