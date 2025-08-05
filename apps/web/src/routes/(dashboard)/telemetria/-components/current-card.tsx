import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-scada-api.gen'
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
          label="A"
          suffix="A"
          value={telemetryData?.corrente_a}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="B"
          suffix="A"
          value={telemetryData?.corrente_b}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="C"
          suffix=" A"
          value={telemetryData?.corrente_c}
        />
        <TelemetryItem
          isLoading={isLoading}
          label="N (calculado)"
          suffix=" A"
          value={telemetryData?.corrente_de_neutro_calculado}
        />
      </CardContent>
    </Card>
  )
}
