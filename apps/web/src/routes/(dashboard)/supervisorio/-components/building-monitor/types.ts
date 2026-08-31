// Tipos de dados dos sensores
export interface Sensor {
  description: string
  // status: string
  enabled: boolean
  health?: string | null
  history: History
  id: number
  lastUpdate: string
  name: string
  position: { x: number; y: number } // Posição em porcentagem
  // limits: { min: number; max: number }
  trend: "up" | "down" | "stable"
  unit: string
  value: number[]
}

export interface PhasePoint {
  phaseA: number | null
  phaseB: number | null
  phaseC: number | null
  time: string
}

export interface History {
  phases: PhasePoint[]
}

export interface Position {
  id: number
  x: number
  y: number
}

export interface Limits {
  max: number
  min: number
}

export interface Meter {
  description?: string | null
  enabled: boolean
  health?: string | null
  id: number
  ip: string
  name: string
  position: Position
  unit: string
  // limits: Limits
}
