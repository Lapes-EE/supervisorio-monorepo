import type { ColumnDef } from '@tanstack/react-table'
import type { LastMeasurementData } from './data'

function formatVoltage(value: number | null): string {
  return value !== null ? `${value.toFixed(1)} V` : '---'
}

function formatError(value: number | null): string {
  if (value === null || value === undefined) {
    return '---'
  }
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)} V`
}

function getErrorClassName(error: number | null): string {
  if (error === null || error === 0) {
    return 'text-muted-foreground'
  }

  return error > 0 ? 'font-medium text-chart-1' : 'font-medium text-chart-1/60'
}

export const columns: ColumnDef<LastMeasurementData>[] = [
  {
    accessorKey: 'name',
    header: 'Medidor',
  },
  {
    accessorKey: 'tensaoFaseNeutroC',
    header: 'Tensão Medida (V)',
    cell: ({ row }) => (
      <span className="text-chart-2">
        {formatVoltage(row.getValue('tensaoFaseNeutroC'))}
      </span>
    ),
  },
  {
    accessorKey: 'estimation',
    header: 'Estimação (V)',
    cell: ({ row }) => (
      <span className="text-chart-4">
        {formatVoltage(row.getValue('estimation'))}
      </span>
    ),
  },
  {
    accessorKey: 'error',
    header: 'Erro (V)',
    cell: ({ row }) => {
      const error = row.getValue('error') as number | null

      return (
        <span className={getErrorClassName(error)}>{formatError(error)}</span>
      )
    },
  },
]
