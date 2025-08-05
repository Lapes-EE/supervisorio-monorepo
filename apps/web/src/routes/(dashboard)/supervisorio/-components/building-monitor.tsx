import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Droplets,
  Gauge,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Tipos de dados dos sensores
interface Sensor {
  id: string
  name: string
  type: 'temperature' | 'pressure' | 'flow' | 'energy' | 'humidity'
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  position: { x: number; y: number } // Posição em porcentagem
  floor: string
  lastUpdate: string
  limits: { min: number; max: number }
  trend: 'up' | 'down' | 'stable'
  history: Array<{ time: string; value: number }>
}

// Dados simulados dos sensores - 13 sensores de energia
const sensors: Sensor[] = [
  // 1° ANDAR - 5 sensores de energia
  {
    id: 'energy-101',
    name: 'Consumo Energético - Sala 101',
    type: 'energy',
    value: 45.3,
    unit: 'kW',
    status: 'normal',
    position: { x: 20, y: 75 },
    floor: '1° Andar',
    lastUpdate: '2024-01-23 14:30:15',
    limits: { min: 20, max: 80 },
    trend: 'stable',
    history: [
      { time: '12:00', value: 43.2 },
      { time: '13:00', value: 44.1 },
      { time: '14:00', value: 45.3 },
      { time: '15:00', value: 45.1 },
    ],
  },
  {
    id: 'energy-102',
    name: 'Consumo Energético - Sala 102',
    type: 'energy',
    value: 67.8,
    unit: 'kW',
    status: 'normal',
    position: { x: 35, y: 75 },
    floor: '1° Andar',
    lastUpdate: '2024-01-23 14:30:18',
    limits: { min: 30, max: 100 },
    trend: 'up',
    history: [
      { time: '12:00', value: 65.0 },
      { time: '13:00', value: 66.1 },
      { time: '14:00', value: 67.8 },
      { time: '15:00', value: 68.2 },
    ],
  },
  {
    id: 'energy-103',
    name: 'Consumo Energético - Sala 103',
    type: 'energy',
    value: 52.4,
    unit: 'kW',
    status: 'normal',
    position: { x: 50, y: 75 },
    floor: '1° Andar',
    lastUpdate: '2024-01-23 14:30:10',
    limits: { min: 25, max: 85 },
    trend: 'down',
    history: [
      { time: '12:00', value: 55.1 },
      { time: '13:00', value: 53.5 },
      { time: '14:00', value: 52.4 },
      { time: '15:00', value: 51.8 },
    ],
  },
  {
    id: 'energy-104',
    name: 'Consumo Energético - Sala 104',
    type: 'energy',
    value: 89.7,
    unit: 'kW',
    status: 'warning',
    position: { x: 65, y: 75 },
    floor: '1° Andar',
    lastUpdate: '2024-01-23 14:30:05',
    limits: { min: 40, max: 90 },
    trend: 'up',
    history: [
      { time: '12:00', value: 85.2 },
      { time: '13:00', value: 87.5 },
      { time: '14:00', value: 89.7 },
      { time: '15:00', value: 90.1 },
    ],
  },
  {
    id: 'energy-105',
    name: 'Consumo Energético - Corredor 1° Andar',
    type: 'energy',
    value: 23.6,
    unit: 'kW',
    status: 'normal',
    position: { x: 80, y: 75 },
    floor: '1° Andar',
    lastUpdate: '2024-01-23 14:30:08',
    limits: { min: 15, max: 40 },
    trend: 'stable',
    history: [
      { time: '12:00', value: 23.3 },
      { time: '13:00', value: 23.4 },
      { time: '14:00', value: 23.6 },
      { time: '15:00', value: 23.5 },
    ],
  },

  // 2° ANDAR - 5 sensores de energia
  {
    id: 'energy-201',
    name: 'Consumo Energético - Sala 201',
    type: 'energy',
    value: 78.9,
    unit: 'kW',
    status: 'normal',
    position: { x: 20, y: 50 },
    floor: '2° Andar',
    lastUpdate: '2024-01-23 14:30:12',
    limits: { min: 35, max: 95 },
    trend: 'up',
    history: [
      { time: '12:00', value: 75.1 },
      { time: '13:00', value: 77.2 },
      { time: '14:00', value: 78.9 },
      { time: '15:00', value: 79.3 },
    ],
  },
  {
    id: 'energy-202',
    name: 'Consumo Energético - Sala 202',
    type: 'energy',
    value: 56.2,
    unit: 'kW',
    status: 'normal',
    position: { x: 35, y: 50 },
    floor: '2° Andar',
    lastUpdate: '2024-01-23 14:30:14',
    limits: { min: 30, max: 80 },
    trend: 'stable',
    history: [
      { time: '12:00', value: 55.7 },
      { time: '13:00', value: 56.1 },
      { time: '14:00', value: 56.2 },
      { time: '15:00', value: 56.4 },
    ],
  },
  {
    id: 'energy-203',
    name: 'Consumo Energético - Sala 203',
    type: 'energy',
    value: 43.1,
    unit: 'kW',
    status: 'normal',
    position: { x: 50, y: 50 },
    floor: '2° Andar',
    lastUpdate: '2024-01-23 14:30:16',
    limits: { min: 25, max: 70 },
    trend: 'down',
    history: [
      { time: '12:00', value: 45.1 },
      { time: '13:00', value: 44.2 },
      { time: '14:00', value: 43.1 },
      { time: '15:00', value: 42.8 },
    ],
  },
  {
    id: 'energy-204',
    name: 'Consumo Energético - Sala 204',
    type: 'energy',
    value: 125.8,
    unit: 'kW',
    status: 'critical',
    position: { x: 65, y: 50 },
    floor: '2° Andar',
    lastUpdate: '2024-01-23 14:30:05',
    limits: { min: 50, max: 120 },
    trend: 'up',
    history: [
      { time: '12:00', value: 110.2 },
      { time: '13:00', value: 118.5 },
      { time: '14:00', value: 125.8 },
      { time: '15:00', value: 128.1 },
    ],
  },
  {
    id: 'energy-205',
    name: 'Consumo Energético - Corredor 2° Andar',
    type: 'energy',
    value: 31.4,
    unit: 'kW',
    status: 'normal',
    position: { x: 80, y: 50 },
    floor: '2° Andar',
    lastUpdate: '2024-01-23 14:30:09',
    limits: { min: 20, max: 50 },
    trend: 'stable',
    history: [
      { time: '12:00', value: 30.8 },
      { time: '13:00', value: 31.2 },
      { time: '14:00', value: 31.4 },
      { time: '15:00', value: 31.6 },
    ],
  },

  // 3° ANDAR - 3 sensores de energia
  {
    id: 'energy-301',
    name: 'Consumo Energético - Sala 301',
    type: 'energy',
    value: 62.7,
    unit: 'kW',
    status: 'normal',
    position: { x: 30, y: 25 },
    floor: '3° Andar',
    lastUpdate: '2024-01-23 14:30:13',
    limits: { min: 30, max: 85 },
    trend: 'stable',
    history: [
      { time: '12:00', value: 62.0 },
      { time: '13:00', value: 62.4 },
      { time: '14:00', value: 62.7 },
      { time: '15:00', value: 62.5 },
    ],
  },
  {
    id: 'energy-302',
    name: 'Consumo Energético - Sala 302',
    type: 'energy',
    value: 94.3,
    unit: 'kW',
    status: 'warning',
    position: { x: 50, y: 25 },
    floor: '3° Andar',
    lastUpdate: '2024-01-23 14:30:07',
    limits: { min: 40, max: 95 },
    trend: 'up',
    history: [
      { time: '12:00', value: 90.2 },
      { time: '13:00', value: 92.8 },
      { time: '14:00', value: 94.3 },
      { time: '15:00', value: 94.9 },
    ],
  },
  {
    id: 'energy-303',
    name: 'Consumo Energético - Corredor 3° Andar',
    type: 'energy',
    value: 18.5,
    unit: 'kW',
    status: 'normal',
    position: { x: 70, y: 25 },
    floor: '3° Andar',
    lastUpdate: '2024-01-23 14:30:11',
    limits: { min: 10, max: 30 },
    trend: 'down',
    history: [
      { time: '12:00', value: 19.7 },
      { time: '13:00', value: 19.1 },
      { time: '14:00', value: 18.5 },
      { time: '15:00', value: 18.2 },
    ],
  },
]

// Componente para ícones dos sensores
const SensorIcon = ({
  type,
  status,
}: {
  type: Sensor['type']
  status: Sensor['status']
}) => {
  const getColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      default:
        return 'text-green-500'
    }
  }

  const iconProps = { className: `h-5 w-5 ${getColor()}` }

  switch (type) {
    case 'temperature':
      return <Thermometer {...iconProps} />
    case 'pressure':
      return <Gauge {...iconProps} />
    case 'flow':
      return <Droplets {...iconProps} />
    case 'energy':
      return <Zap {...iconProps} />
    case 'humidity':
      return <Wind {...iconProps} />
    default:
      return <Activity {...iconProps} />
  }
}

// Componente principal
export function BuildingMonitor() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)

  const getStatusBadge = (status: Sensor['status']) => {
    switch (status) {
      case 'critical':
        return (
          <Badge className="flex items-center gap-1" variant="destructive">
            <AlertTriangle className="h-3 w-3" />
            Crítico
          </Badge>
        )
      case 'warning':
        return (
          <Badge
            className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
            variant="secondary"
          >
            <AlertTriangle className="h-3 w-3" />
            Atenção
          </Badge>
        )
      default:
        return (
          <Badge
            className="flex items-center gap-1 bg-green-100 text-green-800"
            variant="default"
          >
            <CheckCircle className="h-3 w-3" />
            Normal
          </Badge>
        )
    }
  }

  const getTrendIcon = (trend: Sensor['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="h-full w-full">
      {/* Container da imagem com sensores */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          {/* Imagem do corte lateral do prédio */}
          <div className="relative h-[600px] w-full ">
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
            {sensors.map((sensor) => (
              <Button
                className="-translate-x-1/2 -translate-y-1/2 absolute z-10 transform rounded-full border-2 bg-white p-2 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white/50"
                key={sensor.id}
                onClick={() => setSelectedSensor(sensor)}
                size="icon"
                style={{
                  left: `${sensor.position.x}%`,
                  top: `${sensor.position.y}%`,
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
                <SensorIcon status={sensor.status} type={sensor.type} />

                {/* Indicador pulsante para alarmes críticos */}
                {sensor.status === 'critical' && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-30" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">
            Sensores de Energia - 13 Pontos de Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <span className="text-sm">Normal (0-80% da capacidade)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Atenção (80-95% da capacidade)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm">
                Crítico (acima de 95% da capacidade)
              </span>
            </div>
          </div>
          <div className="mt-4 text-gray-600 text-sm dark:text-gray-400">
            <strong>Distribuição:</strong> 1° Andar (5 sensores) • 2° Andar (5
            sensores) • 3° Andar (3 sensores)
          </div>
        </CardContent>
      </Card>

      {/* Modal com detalhes do sensor */}
      <Dialog
        onOpenChange={() => setSelectedSensor(null)}
        open={!!selectedSensor}
      >
        <DialogContent className="max-w-2xl">
          {selectedSensor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <SensorIcon
                    status={selectedSensor.status}
                    type={selectedSensor.type}
                  />
                  {selectedSensor.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedSensor.floor} • Última atualização:{' '}
                  {selectedSensor.lastUpdate}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Valor atual e status */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-3xl">
                      {selectedSensor.value}
                      {selectedSensor.unit}
                      {getTrendIcon(selectedSensor.trend)}
                    </div>
                    <div className="text-gray-600 text-sm dark:text-gray-400">
                      Limites: {selectedSensor.limits.min} -{' '}
                      {selectedSensor.limits.max} {selectedSensor.unit}
                    </div>
                  </div>
                  {getStatusBadge(selectedSensor.status)}
                </div>

                {/* Gráfico histórico */}
                <div>
                  <h4 className="mb-3 font-semibold text-lg">
                    Histórico (Últimas 4 horas)
                  </h4>
                  <ResponsiveContainer height={200} width="100%">
                    <LineChart data={selectedSensor.history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        dataKey="value"
                        stroke={(() => {
                          if (selectedSensor.status === 'critical') {
                            return '#ef4444'
                          }
                          if (selectedSensor.status === 'warning') {
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
    </div>
  )
}
