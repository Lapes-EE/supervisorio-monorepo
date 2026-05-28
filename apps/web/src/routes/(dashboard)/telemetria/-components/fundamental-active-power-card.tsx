import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

interface FundamentalActivePowerCardProps {
  telemetryData: GetTelemetry200DataItem | undefined
  isLoading: boolean
}

export function FundamentalActivePowerCard({
  telemetryData,
  isLoading,
}: FundamentalActivePowerCardProps) {
  const total =
    (telemetryData?.potenciaAtivaFundamentalA ?? 0) +
    (telemetryData?.potenciaAtivaFundamentalB ?? 0) +
    (telemetryData?.potenciaAtivaFundamentalC ?? 0)

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
          value={telemetryData?.potenciaAtivaFundamentalA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="W"
          value={telemetryData?.potenciaAtivaFundamentalB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="W"
          value={telemetryData?.potenciaAtivaFundamentalC}
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
