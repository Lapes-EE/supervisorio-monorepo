import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Sensor } from './types'

export function useSensorStatus() {
  const getStatusBadge = (status: Sensor['status']) => {
    if (status === 'critical') {
      return (
        <Badge className="flex items-center gap-1" variant="destructive">
          <AlertTriangle className="h-3 w-3" />
          Crítico
        </Badge>
      )
    }

    if (status === 'warning') {
      return (
        <Badge
          className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
          variant="secondary"
        >
          <AlertTriangle className="h-3 w-3" />
          Atenção
        </Badge>
      )
    }

    if (status === 'normal') {
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

    return (
      <Badge className="flex items-center gap-1" variant="secondary">
        <AlertTriangle className="h-3 w-3" />
        Desconhecido
      </Badge>
    )
  }

  const getTrendIcon = (trend: Sensor['trend']) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    }

    if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-blue-500" />
    }

    if (trend === 'stable') {
      return <Activity className="h-4 w-4 text-green-500" />
    }

    return <Activity className="h-4 w-4 text-gray-500" />
  }

  return { getStatusBadge, getTrendIcon }
}
