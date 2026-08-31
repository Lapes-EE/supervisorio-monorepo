import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GetTelemetry200DataItem } from "@/http/gen/model/get-telemetry200-data-item"
import TelemetryItem from "./telemetry-item"

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
          value={telemetryData?.measurements?.fpRealFaseA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          value={telemetryData?.measurements?.fpDeslocamentoFaseB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          value={telemetryData?.measurements?.fpDeslocamentoFaseC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Aritmética"
          value={telemetryData?.measurements?.fpRealTotalAritmetica}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Vetorial"
          value={telemetryData?.measurements?.fpRealTotalVetorial}
        />
      </CardContent>
    </Card>
  )
}
