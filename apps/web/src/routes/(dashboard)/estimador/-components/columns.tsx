import NumberFlow from '@number-flow/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { LastMeasurementData } from './data'

function getErrorClassName(error: number | null): string {
  if (error === null || error === 0) {
    return 'text-muted-foreground'
  }

  return error > 0 ? 'font-medium text-chart-1' : 'font-medium text-chart-1/60'
}

export function getColumns(
  _onEditMeter: (meter: LastMeasurementData) => void
): ColumnDef<LastMeasurementData>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Medidor',
      cell: ({ row }) => {
        const isOverridden = row.original.isOverridden
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.original.name}</span>
            {isOverridden && (
              <Badge
                className="gap-1 border-chart-4/40 bg-chart-4/15 text-chart-4 text-xs"
                variant="outline"
              >
                <Sparkles className="h-3 w-3" />
                Simulado
              </Badge>
            )}
          </div>
        )
      },
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
            className={
              row.original.isOverridden
                ? 'font-semibold text-chart-4'
                : 'text-chart-2'
            }
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
    // {
    //   id: 'actions',
    //   header: 'Simular',
    //   cell: ({ row }) => {
    //     return (
    //       <Button
    //         className="h-5 w-5"
    //         onClick={(e) => {
    //           e.stopPropagation()
    //           onEditMeter(row.original)
    //         }}
    //         size="sm"
    //         title="Injetar erro de medição"
    //         variant="ghost"
    //       >
    //         <Edit2 className="size-4 text-muted-foreground" />
    //         <span className="sr-only">Injetar erro</span>
    //       </Button>
    //     )
    //   },
    // },
  ]
}
