import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-scada-api.gen'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

export function TemperatureCard({
  telemetryData,
  isLoading,
}: {
  telemetryData: TelemetryData | undefined
  isLoading: boolean
}) {
  const temperature = telemetryData?.temperatura_sensor_interno ?? 0
  const fillHeight = Math.min(Math.max(temperature, 0), 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperatura</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-4">
        {isLoading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          <span className="font-bold text-4xl">{temperature.toFixed(0)}°C</span>
        )}

        {/* Termômetro estilizado */}
        <div className="relative flex h-40 w-10 flex-col items-center justify-end">
          {/* Bulbo do termômetro */}
          <div className="absolute bottom-0 z-50 h-6 w-6 rounded-full bg-gradient-to-t from-red-600 via-orange-400 to-yellow-300 shadow-md" />

          {/* Corpo do termômetro */}
          <div className="relative z-10 h-full w-4 overflow-hidden rounded-full border bg-gray-200 shadow-inner">
            <div
              className="absolute bottom-0 w-full rounded-t-full bg-gradient-to-t from-red-600 via-orange-400 to-yellow-300 transition-all duration-500"
              style={{ height: `${fillHeight}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
