import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetryIp200 } from '@/http/gen/model/get-telemetry-ip200.gen'
import TelemetryItem from './telemetry-item'

interface CurrentCardProps {
  telemetryData: GetTelemetryIp200 | undefined
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
          value={telemetryData?.corrente_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="A"
          value={telemetryData?.corrente_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="A"
          value={telemetryData?.corrente_c}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Neutro Calculado"
          suffix="A"
          value={telemetryData?.corrente_de_neutro_calculado}
        />
      </CardContent>
    </Card>
  )
}
