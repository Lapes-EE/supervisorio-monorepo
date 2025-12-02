import type { QueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { type ToggleSearchSchema, toggleSearchSchema } from '../../-types'
import { SelectPeriod } from './period-select'
import { SensorChart } from './sensor-chart'
import type { Sensor } from './types'

interface SensorDetailsModalProps {
  sensor: Sensor | null
  onClose: () => void
  queryClient: QueryClient
  search: ToggleSearchSchema
}

export function SensorDetailsModal({
  sensor,
  onClose,
  queryClient,
  search,
}: SensorDetailsModalProps) {
  const phaseOptions = toggleSearchSchema.shape.phase.def.defaultValue
  return (
    <Dialog onOpenChange={onClose} open={!!sensor}>
      <DialogContent className="max-w-2xl">
        {sensor && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {sensor.name}
              </DialogTitle>
              <DialogDescription>
                {sensor.description} • Última atualização: {sensor.lastUpdate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex w-full items-center justify-between gap-2 font-bold text-3xl">
                    <div className="flex flex-col">
                      {phaseOptions.map((label, idx) => {
                        const colorVar = [
                          'var(--chart-1)',
                          'var(--chart-2)',
                          'var(--chart-3)',
                        ][idx % 3]
                        return (
                          <div className="flex items-center gap-2" key={label}>
                            <Label
                              className="font-bold text-2xl"
                              style={{ color: colorVar }}
                            >
                              {label}:
                            </Label>
                            <span>
                              {sensor.value[idx]} {sensor.unit}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex gap-2 font-semibold text-lg">
                  <p>Histórico</p>
                  <SelectPeriod queryClient={queryClient} search={search} />
                </h4>
                <SensorChart search={search} sensor={sensor} />
              </div>

              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link
                    params={{ meterId: sensor.id.toString() }}
                    to="/gráficos/$meterId"
                  >
                    Visualização Estendida
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  <Link
                    params={{ meterId: sensor.id.toString() }}
                    search={{ charts: {} }}
                    to="/settings/$meterId"
                  >
                    Configurar Alarmes
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  Exportar Dados
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
