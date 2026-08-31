import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GetTelemetry200DataItem } from "@/http/gen/model/get-telemetry200-data-item"
import TelemetryItem from "./telemetry-item"

interface PhasePhaseVoltageCardProps {
  isLoading: boolean
  telemetryData: GetTelemetry200DataItem | undefined
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
          value={telemetryData?.measurements?.tensaoFaseFaseAB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B-C"
          suffix="V"
          value={telemetryData?.measurements?.tensaoFaseFaseBC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C-A"
          suffix="V"
          value={telemetryData?.measurements?.tensaoFaseFaseCA}
        />
      </CardContent>
    </Card>
  )
}
