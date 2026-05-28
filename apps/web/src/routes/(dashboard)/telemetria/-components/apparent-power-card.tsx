import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

export function ApparentPowerCard({
  telemetryData,
  isLoading,
}: {
  telemetryData: GetTelemetry200DataItem | undefined
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
          value={telemetryData?.potenciaAparenteA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="VA"
          value={telemetryData?.potenciaAparenteB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="VA"
          value={telemetryData?.potenciaAparenteC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Aritmética"
          suffix="VA"
          value={telemetryData?.potenciaAparenteTotalAritmetica}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Vetorial"
          suffix="VA"
          value={telemetryData?.potenciaAparenteTotalVetorial}
        />
      </CardContent>
    </Card>
  )
}
