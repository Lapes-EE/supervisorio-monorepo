import NumberFlow from '@number-flow/react'
import { useRouteContext, useSearch } from '@tanstack/react-router'
import { RefreshCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { usePatchMeterId } from '@/http/gen/endpoints/lapes-api.gen'
import { toggleSearchSchema } from '../../-types'
import { useSensors } from './data'
import type { Sensor } from './types'

interface BuildingLayoutProps {
  onSensorClick: (sensor: Sensor) => void
}

export function BuildingLayout({ onSensorClick }: BuildingLayoutProps) {
  const search = useSearch({ from: '/(dashboard)/supervisorio/' })
  const { queryClient } = useRouteContext({
    from: '/(dashboard)/supervisorio/',
  })
  const { data: sensors } = useSensors(search, search.period)
  const phaseOptions = toggleSearchSchema.shape.phase.def.defaultValue
  const mutation = usePatchMeterId()

  function handleRefresh(sensorId: number) {
    console.log('Muatation')
    mutation.mutate(
      { id: sensorId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['Meters', search.type] })
        },
      }
    )
  }

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
        <div className="relative flex h-full w-full items-start">
          {/** biome-ignore lint/performance/noImgElement: This project doesn't use nextjs for better Image component */}
          <img
            alt="Corte lateral do edifício"
            className="h-full w-full"
            decoding="async"
            loading="lazy"
            src="/anexoC.svg"
          />

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
              {sensor.active ? (
                <Button
                  className="relative z-10 h-full transform border-2 bg-background shadow-lg transition-all duration-200 hover:scale-110 hover:bg-primary-foreground/85"
                  data-active={sensor.active}
                  onClick={() => onSensorClick(sensor)}
                  title={`${sensor.name}: ${sensor.value}${sensor.unit}`}
                >
                  <div className="flex flex-col items-center">
                    <Label className="text-foreground">{sensor.name}</Label>
                    {phaseOptions
                      .map((phase, idx) =>
                        search.phase.includes(phase) ? { phase, idx } : null
                      )
                      .filter(Boolean)
                      .map(({ phase, idx }) => {
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
              ) : (
                <Alert
                  className="relative z-10 w-40 border-2 border-red-500 bg-background shadow-lg"
                  variant="destructive"
                >
                  <AlertTitle>{sensor.name}</AlertTitle>
                  <AlertDescription className="flex items-center justify-center font-light text-sm">
                    <p>Está com alguma falha</p>
                    <Button
                      onClick={() => handleRefresh(sensor.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <RefreshCcw />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
