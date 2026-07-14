import NumberFlow from '@number-flow/react'
import type { QueryClient } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Image } from '@/components/ui/image'
import { Label } from '@/components/ui/label'
import { usePatchMeterId } from '@/http/gen/endpoints/lapes-api'
import { meterKeys } from '@/lib/query-keys'
import type { ToggleSearchSchema } from '../../-types'
import { getPhaseLabels, isSingleValue } from './constants'
import { fixedPositions, useSensors } from './data'
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
  const mutation = usePatchMeterId()
  const phaseLabels = getPhaseLabels(search.type)
  const isSingle = isSingleValue(search.type)

  function handleRefresh(sensorId: number) {
    mutation.mutate(
      { id: sensorId, data: { enabled: true } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: meterKeys.byType(search.type),
          })
        },
      }
    )
  }

  const activePhases = phaseLabels
    .map((label, idx) => ({
      label,
      idx,
      color: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'][idx % 3],
      isSelected:
        isSingle ||
        search.phase.includes(['A', 'B', 'C'][idx] as 'A' | 'B' | 'C'),
    }))
    .filter(({ isSelected }) => isSelected)

  return (
    <Card className="-p-2">
      <CardContent className="p-2">
        {/* Imagem do corte lateral do prédio */}
        <div className="relative flex h-full w-full items-start">
          {/** FALLBACK */}
          <Image
            alt="Corte lateral do edifício"
            blurSrc="/anexoC_f_blur.png"
            className="dark:invert"
            loading="lazy"
            src="/anexoC_f.svg"
          />

          {/* Sensores clicáveis */}
          {sensors?.map((sensor) => {
            const position = fixedPositions.find((pos) => pos.id === sensor.id)

            if (!position) {
              return null
            } // caso não exista posição definida para esse sensor.id

            return (
              <div
                className="-translate-x-1/2 -translate-y-1/2 absolute z-20"
                key={sensor.id}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
              >
                {sensor.enabled && sensor.health === 'healthy' ? (
                  <Button
                    className="relative h-28 w-24 transform border-2 bg-background shadow-lg transition-all duration-200 hover:scale-110 hover:bg-primary-foreground/85"
                    data-active={sensor.enabled}
                    onClick={() => onSensorClick(sensor)}
                    title={`${sensor.name}: ${sensor.value}${sensor.unit}`}
                  >
                    <div className="flex flex-col items-center">
                      <Label className="wrap-break-words max-w-24 whitespace-normal text-center text-foreground">
                        {sensor.name}
                      </Label>
                      {activePhases.map(({ label, idx, color }) => (
                        <div
                          className="flex select-none items-center justify-center text-center font-medium text-gray-700 text-xs"
                          key={label}
                          style={{ color }}
                        >
                          <NumberFlow
                            className="font-bold text-lg"
                            format={{ minimumFractionDigits: 2 }}
                            prefix={isSingle ? '' : `${label} `}
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
                      <p>
                        {sensor.enabled
                          ? 'Está com alguma falha'
                          : 'Desativado'}
                      </p>
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
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
