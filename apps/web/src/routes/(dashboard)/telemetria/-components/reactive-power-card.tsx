import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

export function ReactivePowerCard({
  telemetryData,
  isLoading,
}: {
  telemetryData: GetTelemetry200DataItem | undefined
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
          value={telemetryData?.measurements?.potenciaReativaA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="var"
          value={telemetryData?.measurements?.potenciaReativaB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="var"
          value={telemetryData?.measurements?.potenciaReativaC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Aritmética"
          suffix="var"
          value={telemetryData?.measurements?.potenciaReativaTotalAritmetica}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Vetorial"
          suffix="var"
          value={telemetryData?.measurements?.potenciaReativaTotalVetorial}
        />
      </CardContent>
    </Card>
  )
}
