import NumberFlow from '@number-flow/react'
import { useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSensors } from './data'
import { SensorIcon } from './sensor-icon'
import { useSensorStatus } from './sensor-status-utils'
import type { Sensor } from './types'

interface BuildingLayoutProps {
  onSensorClick: (sensor: Sensor) => void
}

export function BuildingLayout({ onSensorClick }: BuildingLayoutProps) {
  const { period } = useSearch({ from: '/(dashboard)/supervisorio/' })
  const { getTrendIcon } = useSensorStatus()
  const search = useSearch({ from: '/(dashboard)/supervisorio/' })
  const { data: sensors, isLoading: isSensorLoading } = useSensors(
    search,
    period
  )

  function getSensorStatusColor(status: string, isLoading?: boolean) {
    if (isLoading) {
      return '#9ca3af' // Gray for loading state
    }
    if (status === 'critical') {
      return '#ef4444' // Red
    }
    if (status === 'warning') {
      return '#f59e0b' // Yellow
    }
    return '#10b981' // Green
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-0">
        {/* Imagem do corte lateral do prédio */}
        <div className="relative h-[600px] w-full ">
          {/** biome-ignore lint/performance/noImgElement: This project doesn't use nextjs for better Image component */}
          <img
            alt="Corte lateral do edifício"
            className="h-full w-full object-cover"
            decoding="async"
            loading="lazy"
            src="/placeholder.svg"
          />
          {/* Overlay com estrutura básica do prédio */}
          <div className="pointer-events-none absolute inset-0">
            {/* Linhas dos andares */}
            <div className="absolute right-[10%] bottom-[20%] left-[10%] h-0.5 bg-gray-400 opacity-50" />
            <div className="absolute right-[10%] bottom-[45%] left-[10%] h-0.5 bg-gray-400 opacity-50" />
            <div className="absolute right-[10%] bottom-[70%] left-[10%] h-0.5 bg-gray-400 opacity-50" />

            {/* Labels dos andares */}
            <div className="absolute bottom-[75%] left-[2%] rounded bg-white px-2 py-1 font-semibold text-gray-700 text-sm shadow">
              3° Andar
            </div>
            <div className="absolute bottom-[50%] left-[2%] rounded bg-white px-2 py-1 font-semibold text-gray-700 text-sm shadow">
              2° Andar
            </div>
            <div className="absolute bottom-[25%] left-[2%] rounded bg-white px-2 py-1 font-semibold text-gray-700 text-sm shadow">
              1° Andar
            </div>
          </div>

          {/* Sensores clicáveis */}
          {sensors?.map((sensor) => (
            <div
              className="-translate-x-1/2 -translate-y-1/2 absolute h-20 w-20"
              key={sensor.id}
              style={{
                left: `${sensor.position.x}%`,
                top: `${sensor.position.y}%`,
              }}
            >
              <div className="flex flex-col items-center">
                <div className="mb-1 flex select-none items-center justify-center gap-1 text-center font-medium text-gray-700 text-sm">
                  <NumberFlow
                    format={{ minimumFractionDigits: 2 }}
                    suffix={sensor.unit}
                    value={sensor.value}
                  />
                  {getTrendIcon(sensor.trend)}
                </div>

                <Button
                  className="relative z-10 transform rounded-full border-2 bg-white p-2 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white/50"
                  onClick={() => onSensorClick(sensor)}
                  size="icon"
                  style={{
                    borderColor: getSensorStatusColor(
                      sensor.status,
                      isSensorLoading
                    ),
                  }}
                  title={`${sensor.name}: ${sensor.value}${sensor.unit}`}
                >
                  <SensorIcon status={sensor.status} />
                  {sensor.status === 'critical' && (
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-30" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
