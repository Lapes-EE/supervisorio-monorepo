import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-api.gen'
import TelemetryItem from './telemetry-item'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

export function PowerFactorCard({
  telemetryData,
  isLoading,
}: {
  telemetryData: TelemetryData | undefined
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
          value={telemetryData?.fp_real_fase_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase B"
          value={telemetryData?.fp_deslocamento_fase_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Fase C"
          value={telemetryData?.fp_deslocamento_fase_c}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Aritmética"
          value={telemetryData?.fp_real_total_soma_aritmetica}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="Soma Vetorial"
          value={telemetryData?.fp_real_total_soma_vetorial}
        />
      </CardContent>
    </Card>
  )
}
