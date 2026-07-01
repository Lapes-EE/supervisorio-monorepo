import { createFileRoute } from '@tanstack/react-router'
import { AlertCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { columns } from './-components/colums'
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
        <h1 className="mb-6 font-bold text-2xl">Estimador de Medidores</h1>
        <p className="text-muted-foreground">
          Nenhum dado de medição disponível.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 font-bold text-2xl">Estimador de Medidores</h1>

      <div className="flex gap-6">
        <div className="flex-1">
          <DataTable
            columns={columns}
            data={data}
            onRowClick={handleRowClick}
            selectedRowId={selectedMeterId}
          />
        </div>
        <Card className="flex-1">
          <MeterChart selectedMeterId={selectedMeterId} />
        </Card>
      </div>
    </div>
  )
}
