'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { LastMeasurementData } from './data'

function formatVoltage(value: number | null): string {
  return value !== null ? `${value.toFixed(1)} V` : '---'
}

export const columns: ColumnDef<LastMeasurementData>[] = [
  {
    accessorKey: 'name',
    header: 'Medidor',
  },
  {
    accessorKey: 'tensaoFaseNeutroC',
    header: 'Tensão Fase C (V)',
    cell: ({ row }) => formatVoltage(row.getValue('tensaoFaseNeutroC')),
  },
  {
    accessorKey: 'estimation',
    header: 'Estimativa',
    cell: () => '---',
  },
]
