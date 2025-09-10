import NumberFlow from '@number-flow/react'
import type { QueryClient } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { usePatchMeterId } from '@/http/gen/endpoints/lapes-api.gen'
import { type ToggleSearchSchema, toggleSearchSchema } from '../../-types'
import { useSensors } from './data'
import type { Sensor } from './types'

interface BuildingLayoutProps {
  onSensorClick: (sensor: Sensor) => void
  search: ToggleSearchSchema
  queryClient: QueryClient
}

export function BuildingLayout({
  onSensorClick,
  search,
  queryClient,
}: BuildingLayoutProps) {
  const { data: sensors } = useSensors(search, search.period)
  const phaseOptions = toggleSearchSchema.shape.phase.def.defaultValue
  const mutation = usePatchMeterId()

  function handleRefresh(sensorId: number) {
    console.log('Mutation')
    mutation.mutate(
      { id: sensorId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['Meters', search.type] })
        },
      }
    )
  }

  // Preparar fases ativas com cores
  const activePhases = phaseOptions
    .map((phase, idx) => ({
      phase,
      idx,
      color: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'][idx % 3],
      isSelected: search.phase.includes(phase),
    }))
    .filter(({ isSelected }) => isSelected)

  return (
    <Card className="-p-2">
      <CardContent className="p-2">
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
                  className="relative z-10 h-28 w-24 transform border-2 bg-background shadow-lg transition-all duration-200 hover:scale-110 hover:bg-primary-foreground/85"
                  data-active={sensor.active}
                  onClick={() => onSensorClick(sensor)}
                  title={`${sensor.name}: ${sensor.value}${sensor.unit}`}
                >
                  <div className="flex flex-col items-center">
                    <Label className="max-w-[6rem] whitespace-normal break-words text-center text-foreground">
                      {sensor.name}
                    </Label>
                    {activePhases.map(({ phase, idx, color }) => (
                      <div
                        className="flex select-none items-center justify-center text-center font-medium text-gray-700 text-xs"
                        key={phase}
                        style={{ color }}
                      >
                        <NumberFlow
                          className="font-bold text-lg"
                          format={{ minimumFractionDigits: 2 }}
                          prefix={`${phase} `}
                          suffix={sensor.unit}
                          value={
                            Array.isArray(sensor.value)
                              ? sensor.value[idx]
                              : sensor.value
                          }
                        />
                      </div>
                    ))}
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
