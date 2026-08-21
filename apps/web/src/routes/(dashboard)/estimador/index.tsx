import { createFileRoute } from '@tanstack/react-router'
import { AlertCircleIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { MeasurementOverride } from '@/http/estimation-api'
import { getColumns } from './-components/columns'
import type { LastMeasurementData } from './-components/data'
import { DataTable } from './-components/data-table'
import { EditVoltageDialog } from './-components/edit-voltage-dialog'
import { MeterChart } from './-components/meter-chart'
import { SimulationBanner } from './-components/simulation-banner'
import { useLastMeasurements } from './-components/use-last-measurements'

export const Route = createFileRoute('/(dashboard)/estimador/')({
  component: RouteComponent,
})

function RouteComponent() {
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

  const handleSaveOverride = (meterId: number, voltage: number) => {
    setOverrides((prev) => ({
      ...prev,
      [meterId]: {
        meterId,
        tensaoFaseNeutroC: voltage,
      },
    }))
  }

  const handleClearOverride = (meterId: number) => {
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[meterId]
      return next
    })
  }

  const handleResetAllOverrides = () => {
    setOverrides({})
  }

  const columns = getColumns(handleEditClick)

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="h-64 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

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

  if (!data || data.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="mb-6 font-bold text-2xl">Estimação de Estados</h1>
        <p className="text-muted-foreground">
          Nenhum dado de medição disponível.
        </p>
      </div>
    )
  }

  const selectedMeter = data?.find((d) => d.meterId === selectedMeterId)

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-bold text-2xl">Estimação de Estados</h1>
          <h2 className="text-lg text-muted-foreground">Fase C</h2>
        </div>
      </div>

      <SimulationBanner
        onReset={handleResetAllOverrides}
        overridesCount={overridesList.length}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <DataTable
            columns={columns}
            data={data}
            onRowClick={handleRowClick}
            selectedRowId={selectedMeterId}
          />
        </div>
        <div className="flex-1">
          <MeterChart
            latestTime={selectedMeter?.time}
            selectedEstimation={selectedMeter?.estimation}
            selectedMeterId={selectedMeterId}
          />
        </div>
      </div>

      <EditVoltageDialog
        meter={editingMeter}
        onClear={handleClearOverride}
        onOpenChange={setDialogOpen}
        onSave={handleSaveOverride}
        open={dialogOpen}
      />
    </div>
  )
}
