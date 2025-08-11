import { Zap } from 'lucide-react'
import type { Sensor } from './types'

// Componente para ícones dos sensores
export const SensorIcon = ({ status }: { status: Sensor['status'] }) => {
  const getColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      case 'normal':
        return 'text-green-500'
      default:
        return 'text-blue-500'
    }
  }

  const iconProps = { className: `h-5 w-5 ${getColor()}` }
  return <Zap {...iconProps} />
}
