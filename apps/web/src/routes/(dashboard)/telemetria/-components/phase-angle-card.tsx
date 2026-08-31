import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GetTelemetry200DataItem } from "@/http/gen/model/get-telemetry200-data-item"
import TelemetryItem from "./telemetry-item"

interface PhaseAngleCardProps {
  isLoading: boolean
  telemetryData: GetTelemetry200DataItem | undefined
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
            value={telemetryData?.measurements?.anguloFaseA}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="Ângulo Fase B"
            suffix="°"
            value={telemetryData?.measurements?.anguloFaseB}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="Ângulo Fase C"
            suffix="°"
            value={telemetryData?.measurements?.anguloFaseC}
          />
        </div>
        <div>
          <TelemetryItem
            isLoading={isLoading}
            label="Phi Fase A"
            suffix="°"
            value={telemetryData?.measurements?.phiFaseA}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="Phi Fase B"
            suffix="°"
            value={telemetryData?.measurements?.phiFaseB}
          />
          <TelemetryItem
            isLoading={isLoading}
            label="Phi Fase C"
            suffix="°"
            value={telemetryData?.measurements?.phiFaseC}
          />
        </div>
      </CardContent>
    </Card>
  )
}
