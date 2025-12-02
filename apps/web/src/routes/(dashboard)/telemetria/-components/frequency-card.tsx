import NumberFlow from '@number-flow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { GetTelemetryIp200 } from '@/http/gen/model'

interface FrequencyCardProps {
  telemetryData: GetTelemetryIp200 | undefined
}

export function FrequencyCard({ telemetryData }: FrequencyCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Frequência</CardTitle>
      </CardHeader>
      <CardContent>
        {telemetryData ? (
          <NumberFlow
            className="font-bold text-2xl"
            format={{ minimumFractionDigits: 2 }}
            suffix="Hz"
            value={telemetryData?.frequencia}
          />
        ) : (
          <Skeleton className="h-5 w-10" />
        )}
      </CardContent>
    </Card>
  )
}
