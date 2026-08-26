import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { AlertCircleIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { MeasurementOverride } from '@/http/estimation-api'
import { getColumns } from './-components/columns'
import type { LastMeasurementData } from './-components/data'
import { DataTable } from './-components/data-table'
import { EditVoltageDialog } from './-components/edit-voltage-dialog'
import { MeterChart } from './-components/meter-chart'
import { SimulationBanner } from './-components/simulation-banner'
import { MEASURE_CONFIG, measureTypeSchema } from './-components/types'
import { useLastMeasurements } from './-components/use-last-measurements'

export const Route = createFileRoute('/(dashboard)/estimador/')({
  component: RouteComponent,
  validateSearch: zodValidator(measureTypeSchema),
})

function RouteComponent() {
  const { type: selectedMeasure } = Route.useSearch()
  const [overrides, setOverrides] = useState<
    Record<number, MeasurementOverride>
  >({})
  const overridesList = useMemo(() => Object.values(overrides), [overrides])

  const { data, isLoading, isError } = useLastMeasurements(overridesList)
  const [selectedMeterId, setSelectedMeterId] = useState<number | undefined>(
    undefined
  )
  const [editingMeter, setEditingMeter] = useState<LastMeasurementData | null>(
    null
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleRowClick = (row: LastMeasurementData) => {
    setSelectedMeterId((current) =>
      current === row.meterId ? undefined : row.meterId
    )
  }

  const handleEditClick = (meter: LastMeasurementData) => {
    setEditingMeter(meter)
    setDialogOpen(true)
  }

  const handleSaveOverride = (override: MeasurementOverride) => {
    setOverrides((prev) => ({
      ...prev,
      [override.meterId]: override,
    }))
  }

  const handleClearOverride = (meterId: number) => {
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[meterId]
      return next
    })
  }

  const navigate = useNavigate({ from: Route.fullPath })
  function handleSelectMeasure(value: string) {
    const result = measureTypeSchema.shape.type.safeParse(value)
    if (!result.success) {
      return
    }

    navigate({
      search: (prev) => ({
        ...prev,
        type: result.data,
      }),
      replace: true,
    })
  }

  const handleResetAllOverrides = () => {
    setOverrides({})
  }

  const columns = getColumns(selectedMeasure, handleEditClick)

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>
            Não foi possível acessar os dados de estimação. Verifique se a API
            está rodando.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const selectedMeter = data?.find((d) => d.meterId === selectedMeterId)

  const items = Object.entries(MEASURE_CONFIG).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-6 font-bold text-2xl">Estimação de Estados</h1>
          <Select onValueChange={handleSelectMeasure} value={selectedMeasure}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione a medição" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SimulationBanner
        onReset={handleResetAllOverrides}
        overridesCount={overridesList.length}
      />
      {isLoading ? (
        <div className="container mx-auto grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-[573px]" />
          <Skeleton className="h-[573px]" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <DataTable
              columns={columns}
              data={data ?? []}
              onRowClick={handleRowClick}
              selectedRowId={selectedMeterId}
            />
          </div>
          <div className="flex-1">
            <MeterChart
              history={selectedMeter?.history}
              selectedMeasure={selectedMeasure}
              selectedMeterId={selectedMeterId}
            />
          </div>
        </div>
      )}

      <EditVoltageDialog
        measureType={selectedMeasure}
        meter={editingMeter}
        onClear={handleClearOverride}
        onOpenChange={setDialogOpen}
        onSave={handleSaveOverride}
        open={dialogOpen}
      />
    </div>
  )
}
