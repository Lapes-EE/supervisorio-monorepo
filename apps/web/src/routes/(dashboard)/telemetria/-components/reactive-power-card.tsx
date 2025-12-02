import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetryIp200 } from '@/http/gen/model'
import TelemetryItem from './telemetry-item'

export function ReactivePowerCard({
  telemetryData,
  isLoading,
}: {
  telemetryData: GetTelemetryIp200 | undefined
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência reativa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          suffix="var"
          value={telemetryData?.potencia_reativa_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="var"
          value={telemetryData?.potencia_reativa_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="var"
          value={telemetryData?.potencia_reativa_c}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Aritmética"
          suffix="var"
          value={telemetryData?.potencia_reativa_total_soma_aritmetica}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Vetorial"
          suffix="var"
          value={telemetryData?.potencia_reativa_total_soma_vetorial}
        />
      </CardContent>
    </Card>
  )
}
