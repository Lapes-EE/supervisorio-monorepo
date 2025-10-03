// Tipos de dados dos sensores
export interface Sensor {
  id: number
  name: string
  description: string
  value: number[]
  unit: string
  // status: string
  active: boolean
  position: { x: number; y: number } // Posição em porcentagem
  lastUpdate: string
  // limits: { min: number; max: number }
  trend: 'up' | 'down' | 'stable'
  history: History
}

export type PhasePoint = {
  time: string
  phaseA: number
  phaseB: number
  phaseC: number
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
  active: boolean
  description?: string | null
  unit: string
  position: Position
  // limits: Limits
}
