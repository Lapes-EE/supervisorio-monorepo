import NumberFlow from '@number-flow/react'
import { useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toggleSearchSchema } from '../../-types'
import { useSensors } from './data'
import type { Sensor } from './types'

interface BuildingLayoutProps {
  onSensorClick: (sensor: Sensor) => void
}

export function BuildingLayout({ onSensorClick }: BuildingLayoutProps) {
  const { period } = useSearch({ from: '/(dashboard)/supervisorio/' })
  const search = useSearch({ from: '/(dashboard)/supervisorio/' })
  const { data: sensors } = useSensors(search, period)
  const phaseOptions = toggleSearchSchema.shape.phase.def.defaultValue

  // function getSensorStatusColor(status: string, isLoading?: boolean) {
  //   if (isLoading) {
  //     return '#9ca3af' // Gray for loading state
  //   }
  //   if (status === 'critical') {
  //     return '#ef4444' // Red
  //   }
  //   if (status === 'warning') {
  //     return '#f59e0b' // Yellow
  //   }
  //   return '#10b981' // Green
  // }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-0">
        {/* Imagem do corte lateral do prédio */}
        <div className="relative flex h-[600px] w-full items-start">
          {/** biome-ignore lint/performance/noImgElement: This project doesn't use nextjs for better Image component */}
          <img
            alt="Corte lateral do edifício"
            className="h-full w-full"
            decoding="async"
            loading="lazy"
            src="/monitor.png"
          />
          {/* Overlay com estrutura básica do prédio */}
          <div className="pointer-events-none absolute inset-0">
            {/* Labels dos andares */}
            <div className="absolute bottom-[78%] left-[2%] rounded bg-white px-2 py-1 font-semibold text-gray-700 text-sm shadow">
              3° Andar
            </div>
            <div className=" absolute bottom-[45%] left-[2%] rounded bg-white px-2 py-1 font-semibold text-gray-700 text-sm shadow">
              2° Andar
            </div>
            <div className="absolute bottom-[15%] left-[2%] rounded bg-white px-2 py-1 font-semibold text-gray-700 text-sm shadow">
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
              <Button
                className="relative z-10 h-full transform border-2 bg-white p-2 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white/50"
                onClick={() => onSensorClick(sensor)}
                title={`${sensor.name}: ${sensor.value}${sensor.unit}`}
              >
                <div className="flex flex-col items-center">
                  {phaseOptions
                    .map((phase, idx) =>
                      search.phase.includes(phase) ? { phase, idx } : null
                    )
                    .filter(Boolean)
                    .map(({ phase, idx }) => {
                      // Escolhe a cor baseada no índice do valor
                      const colorVar = [
                        'var(--chart-1)',
                        'var(--chart-2)',
                        'var(--chart-3)',
                      ][idx % 3]
                      return (
                        <div
                          className="mb-1 flex select-none items-center justify-center gap-1 text-center font-medium text-gray-700 text-sm"
                          key={phase}
                          style={{ color: colorVar }}
                        >
                          <NumberFlow
                            className="font-bold text-lg"
                            format={{ minimumFractionDigits: 2 }}
                            suffix={sensor.unit}
                            value={
                              Array.isArray(sensor.value)
                                ? sensor.value[idx]
                                : sensor.value
                            }
                          />
                        </div>
                      )
                    })}
                </div>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
