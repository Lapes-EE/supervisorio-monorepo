import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
              {/* Valor atual e status */}
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

              {/* Gráfico histórico */}
              <div>
                <h4 className="mb-3 font-semibold text-lg">
                  Histórico (Últimas 5 minutos)
                </h4>
                <ResponsiveContainer height={200} width="100%">
                  <LineChart data={sensor.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="value"
                      stroke={(() => {
                        if (sensor.status === 'critical') {
                          return '#ef4444'
                        }
                        if (sensor.status === 'warning') {
                          return '#f59e0b'
                        }
                        return '#10b981'
                      })()}
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Ações */}
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
