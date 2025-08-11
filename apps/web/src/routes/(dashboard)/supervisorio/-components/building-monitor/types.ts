// Tipos de dados dos sensores
export interface Sensor {
  id: number
  name: string
  description: string
  value: number
  unit: string
  status: string
  position: { x: number; y: number } // Posição em porcentagem
  lastUpdate: string
  limits: { min: number; max: number }
  trend: 'up' | 'down' | 'stable'
  history: Array<{ time: string; value: number }>
}

export interface Position {
  x: number
  y: number
}

export interface Limits {
  min: number
  max: number
}

export interface Meter {
  id: number
  name: string
  ip: string
  description?: string | null
  unit: string
  position: Position
  limits: Limits
}
