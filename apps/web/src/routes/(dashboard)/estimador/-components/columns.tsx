import NumberFlow from '@number-flow/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LastMeasurementData } from './data'
import { MEASURE_CONFIG, type MeasureTypeSearch } from './types'

function getErrorClassName(error: number | null): string {
  if (error === null || error === 0) {
    return 'text-muted-foreground'
  }

  return error > 0 ? 'font-medium text-chart-1' : 'font-medium text-chart-1/60'
}

export function getColumns(
  type: MeasureTypeSearch['type'],
  onEditMeter: (meter: LastMeasurementData) => void
): ColumnDef<LastMeasurementData>[] {
  const { measuredKey, estimatedKey, errorKey, label, unit } =
    MEASURE_CONFIG[type]

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
                className="gap-1 border-chart-5/60 bg-chart-5/40 text-xs"
                variant="outline"
              >
                Erro injetado
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: measuredKey,
      header: `${label} Medida (${unit})`,
      cell: ({ row }) => {
        const value = row.getValue(measuredKey) as number | null
        if (value === null || value === undefined) {
          return <span className="text-muted-foreground">---</span>
        }

        return (
          <NumberFlow
            className={
              row.original.isOverridden
                ? 'font-semibold text-chart-5'
                : 'text-chart-2'
            }
            format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
            suffix={` ${unit}`}
            value={value}
          />
        )
      },
    },
    {
      accessorKey: estimatedKey,
      header: `Estimação (${unit})`,
      cell: ({ row }) => {
        const value = row.getValue(estimatedKey) as number | null
        if (value === null || value === undefined) {
          return <span className="text-muted-foreground">---</span>
        }

        return (
          <NumberFlow
            className="text-chart-4"
            format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
            suffix={` ${unit}`}
            value={value}
          />
        )
      },
    },
    {
      accessorKey: errorKey,
      header: `Resíduo (${unit})`,
      cell: ({ row }) => {
        const error = row.getValue(errorKey) as number | null
        if (error === null || error === undefined) {
          return <span className="text-muted-foreground">---</span>
        }

        const prefix = error > 0 ? '+' : ''

        return (
          <NumberFlow
            className={getErrorClassName(error)}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            prefix={prefix}
            suffix={` ${unit}`}
            value={error}
          />
        )
      },
    },
    {
      id: 'actions',
      header: 'Simular',
      cell: ({ row }) => {
        return (
          <Button
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation()
              onEditMeter(row.original)
            }}
            size="sm"
            title="Injetar erro de medição"
            variant="ghost"
          >
            <Edit className="size-4 text-muted-foreground" />
            <span className="sr-only">Injetar erro</span>
          </Button>
        )
      },
    },
  ]
}
