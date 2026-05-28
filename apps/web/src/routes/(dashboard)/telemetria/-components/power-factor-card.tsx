import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GetTelemetry200DataItem } from '@/http/gen/model/get-telemetry200-data-item'
import TelemetryItem from './telemetry-item'

export function PowerFactorCard({
  telemetryData,
  isLoading,
}: {
  telemetryData: GetTelemetry200DataItem | undefined
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fator de potência</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TelemetryItem
          isLoading={isLoading}
          label="Fase A"
          value={telemetryData?.fpRealFaseA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          value={telemetryData?.fpDeslocamentoFaseB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          value={telemetryData?.fpDeslocamentoFaseC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Aritmética"
          value={telemetryData?.fpRealTotalAritmetica}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Vetorial"
          value={telemetryData?.fpRealTotalVetorial}
        />
      </CardContent>
    </Card>
  )
}
