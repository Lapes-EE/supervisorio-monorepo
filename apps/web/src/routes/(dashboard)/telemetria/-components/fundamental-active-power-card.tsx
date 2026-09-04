import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GetTelemetry200DataItem } from "@/http/gen/model/get-telemetry200-data-item"
import TelemetryItem from "./telemetry-item"

interface FundamentalActivePowerCardProps {
  isLoading: boolean
  telemetryData: GetTelemetry200DataItem | undefined
}

export function FundamentalActivePowerCard({
  telemetryData,
  isLoading,
}: FundamentalActivePowerCardProps) {
  const total =
    (telemetryData?.measurements?.potenciaAtivaFundamentalA ?? 0) +
    (telemetryData?.measurements?.potenciaAtivaFundamentalB ?? 0) +
    (telemetryData?.measurements?.potenciaAtivaFundamentalC ?? 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência ativa fundamental</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          suffix="W"
          value={telemetryData?.measurements?.potenciaAtivaFundamentalA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="W"
          value={telemetryData?.measurements?.potenciaAtivaFundamentalB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="W"
          value={telemetryData?.measurements?.potenciaAtivaFundamentalC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Total"
          suffix="W"
          value={total}
        />
      </CardContent>
    </Card>
  )
}
