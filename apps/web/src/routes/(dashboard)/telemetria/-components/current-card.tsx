import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-api.gen'
import TelemetryItem from './telemetry-item'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

interface CurrentCardProps {
  telemetryData: TelemetryData | undefined
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
