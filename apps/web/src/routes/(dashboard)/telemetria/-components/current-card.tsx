import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

interface CurrentCardProps {
  telemetryData: GetTelemetry200DataItem | undefined
  isLoading: boolean
}

export function CurrentCard({ telemetryData, isLoading }: CurrentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Corrente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          suffix="A"
          value={telemetryData?.measurements?.correnteA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="A"
          value={telemetryData?.measurements?.correnteB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="A"
          value={telemetryData?.measurements?.correnteC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Neutro Calculado"
          suffix="A"
          value={telemetryData?.measurements?.correnteNeutroCalculado}
        />
      </CardContent>
    </Card>
  )
}
