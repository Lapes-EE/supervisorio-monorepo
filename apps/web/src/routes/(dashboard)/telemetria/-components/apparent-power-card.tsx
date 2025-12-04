import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetryIp200 } from '@/http/gen/model/get-telemetry-ip200.gen'
import TelemetryItem from './telemetry-item'

export function ApparentPowerCard({
  telemetryData,
  isLoading,
}: {
  telemetryData: GetTelemetryIp200 | undefined
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Potência aparente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          suffix="VA"
          value={telemetryData?.potencia_aparente_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="VA"
          value={telemetryData?.potencia_aparente_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="VA"
          value={telemetryData?.potencia_aparente_c}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Aritmética"
          suffix="VA"
          value={telemetryData?.potencia_aparente_total_soma_aritmetica}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Vetorial"
          suffix="VA"
          value={telemetryData?.potencia_aparente_total_soma_vetorial}
        />
      </CardContent>
    </Card>
  )
}
