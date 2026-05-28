// Tipos de dados dos sensores
export interface Sensor {
  id: number
  name: string
  description: string
  value: number[]
  unit: string
  // status: string
  enabled: boolean
  health?: string | null
  position: { x: number; y: number } // Posição em porcentagem
  lastUpdate: string
  // limits: { min: number; max: number }
  trend: 'up' | 'down' | 'stable'
  history: History
}

export type PhasePoint = {
  time: string
  phaseA: number | null
  phaseB: number | null
  phaseC: number | null
}

export type History = {
  phases: PhasePoint[]
}

export interface Position {
  id: number
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
  enabled: boolean
  health?: string | null
  description?: string | null
  unit: string
  position: Position
  // limits: Limits
}
