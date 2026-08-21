import { createFileRoute } from '@tanstack/react-router'
import { AlertCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { columns } from './-components/columns'
import type { LastMeasurementData } from './-components/data'
import { DataTable } from './-components/data-table'
import { MeterChart } from './-components/meter-chart'
import { useLastMeasurements } from './-components/use-last-measurements'

export const Route = createFileRoute('/(dashboard)/estimador/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, isError } = useLastMeasurements()
  const [selectedMeterId, setSelectedMeterId] = useState<number | undefined>(
    undefined
  )

  const handleRowClick = (row: LastMeasurementData) => {
    setSelectedMeterId((current) =>
      current === row.meterId ? undefined : row.meterId
    )
  }

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
            Não foi possível acessar os dados de telemetria. Verifique se a API
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
      <h1 className="mb-1 font-bold text-2xl">Estimação de Estados</h1>
      <h2 className="mb-4 text-xl">Fase C</h2>
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
    </div>
  )
}
