import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SelectPeriod } from './period-select'
import { SensorChart } from './sensor-chart'
import { SensorIcon } from './sensor-icon'
import { useSensorStatus } from './sensor-status-utils'
import type { Sensor } from './types'

interface SensorDetailsModalProps {
  sensor: Sensor | null
  onClose: () => void
}

export function SensorDetailsModal({
  sensor,
  onClose,
}: SensorDetailsModalProps) {
  const { getStatusBadge, getTrendIcon } = useSensorStatus()

  return (
    <Dialog onOpenChange={onClose} open={!!sensor}>
      <DialogContent className="max-w-2xl">
        {sensor && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SensorIcon status={sensor.status} />
                {sensor.name}
              </DialogTitle>
              <DialogDescription>
                {sensor.description} • Última atualização: {sensor.lastUpdate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-3xl">
                    {sensor.value}
                    {sensor.unit}
                    {getTrendIcon(sensor.trend)}
                  </div>
                  <div className="text-gray-600 text-sm dark:text-gray-400">
                    Limites: {sensor.limits.min} - {sensor.limits.max}{' '}
                    {sensor.unit}
                  </div>
                </div>
                {getStatusBadge(sensor.status)}
              </div>

              <div>
                <h4 className="mb-3 flex gap-2 font-semibold text-lg">
                  <p>Histórico</p>
                  <SelectPeriod />
                </h4>
                <SensorChart sensor={sensor} />
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Ver Histórico Completo
                </Button>
                <Button size="sm" variant="outline">
                  Configurar Alarmes
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
