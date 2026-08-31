import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GetTelemetry200DataItem } from "@/http/gen/model/get-telemetry200-data-item"
import TelemetryItem from "./telemetry-item"

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
          value={telemetryData?.measurements?.potenciaAparenteA}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          suffix="VA"
          value={telemetryData?.measurements?.potenciaAparenteB}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          suffix="VA"
          value={telemetryData?.measurements?.potenciaAparenteC}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Aritmética"
          suffix="VA"
          value={telemetryData?.measurements?.potenciaAparenteTotalAritmetica}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Vetorial"
          suffix="VA"
          value={telemetryData?.measurements?.potenciaAparenteTotalVetorial}
        />
      </CardContent>
    </Card>
  )
}
