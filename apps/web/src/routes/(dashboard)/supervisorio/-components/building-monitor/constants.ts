import type { typeOption } from '../../-types'

export type TypeOption = (typeof typeOption)[number]

export const parameterGroups = [
  {
    label: 'Tensão',
    options: [
      { value: 'voltage_fn' as const, label: 'Fase-Neutro' },
      { value: 'voltage_ff' as const, label: 'Fase-Fase' },
    ],
  },
  {
    label: 'Corrente',
    options: [
      { value: 'current' as const, label: 'Fases A, B, C' },
      { value: 'current_neutral' as const, label: 'Neutro' },
    ],
  },
  {
    label: 'Potência',
    options: [
      { value: 'power_active' as const, label: 'Ativa Fundamental' },
      { value: 'power_reactive' as const, label: 'Reativa' },
      { value: 'power_apparent' as const, label: 'Aparente' },
    ],
  },
  {
    label: 'Frequência',
    options: [{ value: 'frequency' as const, label: 'Frequência' }],
  },
] as const satisfies {
  label: string
  options: { value: TypeOption; label: string }[]
}[]

export const parameterUnits: Record<TypeOption, string> = {
  voltage_fn: 'V',
  voltage_ff: 'V',
  current: 'A',
  current_neutral: 'A',
  power_active: 'kW',
  power_reactive: 'kVAR',
  power_apparent: 'kVA',
  frequency: 'Hz',
}

export const parameterLabels: Record<TypeOption, string> = {
  voltage_fn: 'Tensão Fase-Neutro',
  voltage_ff: 'Tensão Fase-Fase',
  current: 'Corrente',
  current_neutral: 'Corrente Neutro',
  power_active: 'Potência Ativa Fundamental',
  power_reactive: 'Potência Reativa',
  power_apparent: 'Potência Aparente',
  frequency: 'Frequência',
}

export function getPhaseLabels(type: TypeOption): string[] {
  switch (type) {
    case 'voltage_ff':
      return ['AB', 'BC', 'CA']
    case 'current_neutral':
      return ['Neutro']
    case 'frequency':
      return ['Frequência']
    default:
      return ['A', 'B', 'C']
  }
}

export function isSingleValue(type: TypeOption): boolean {
  return type === 'frequency' || type === 'current_neutral'
}
