import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSensors } from './data'
import { SensorIcon } from './sensor-icon'
import type { Sensor } from './types'

interface BuildingLayoutProps {
  onSensorClick: (sensor: Sensor) => void
}

export function BuildingLayout({ onSensorClick }: BuildingLayoutProps) {
  const { data: sensors } = useSensors()
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
            src="/placeholder.svg?height=600&width=800"
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
              className="-translate-x-1/2 -translate-y-1/2 absolute"
              key={sensor.id}
              style={{
                left: `${sensor.position.x}%`,
                top: `${sensor.position.y}%`,
              }}
            >
              <div className="mb-1 select-none text-center font-medium text-gray-700 text-sm">
                {sensor.value}
                {sensor.unit}
              </div>

              <Button
                className="relative z-10 transform rounded-full border-2 bg-white p-2 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white/50"
                onClick={() => onSensorClick(sensor)}
                size="icon"
                style={{
                  borderColor: (() => {
                    if (sensor.status === 'critical') {
                      return '#ef4444'
                    }
                    if (sensor.status === 'warning') {
                      return '#f59e0b'
                    }
                    return '#10b981'
                  })(),
                }}
                title={`${sensor.name}: ${sensor.value}${sensor.unit}`}
              >
                <SensorIcon status={sensor.status} />

                {/* Indicador pulsante para alarmes críticos */}
                {sensor.status === 'critical' && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-30" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
