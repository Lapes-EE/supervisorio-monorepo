import NumberFlow from '@number-flow/react'
import type { ColumnDef } from '@tanstack/react-table'
import type { LastMeasurementData } from './data'

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
    cell: ({ row }) => {
      const value = row.getValue('tensaoFaseNeutroC') as number | null
      if (value === null || value === undefined) {
        return <span className="text-muted-foreground">---</span>
      }

      return (
        <NumberFlow
          className="text-chart-2"
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
          suffix=" V"
          value={value}
        />
      )
    },
  },
  {
    accessorKey: 'estimation',
    header: 'Estimação (V)',
    cell: ({ row }) => {
      const value = row.getValue('estimation') as number | null
      if (value === null || value === undefined) {
        return <span className="text-muted-foreground">---</span>
      }

      return (
        <NumberFlow
          className="text-chart-4"
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
          suffix=" V"
          value={value}
        />
      )
    },
  },
  {
    accessorKey: 'error',
    header: 'Resíduo (V)',
    cell: ({ row }) => {
      const error = row.getValue('error') as number | null
      if (error === null || error === undefined) {
        return <span className="text-muted-foreground">---</span>
      }

      const prefix = error > 0 ? '+' : ''

      return (
        <NumberFlow
          className={getErrorClassName(error)}
          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          prefix={prefix}
          suffix=" V"
          value={error}
        />
      )
    },
  },
]
