import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChartsList } from './-components/charts-list'
import type { MeasurementKey } from './-types'

export const Route = createFileRoute('/(dashboard)/gráficos/$meterId')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    const meterId = Number(params.meterId)
    const data = context.meters.find((meter) => meter.id === meterId)
    return { data }
  },
})

const measurementTypes = [
  { value: 'voltage', label: 'Tensão (V)', color: '#3b82f6', unit: 'V' },
  { value: 'current', label: 'Corrente (A)', color: '#ef4444', unit: 'A' },
  { value: 'power', label: 'Potência (W)', color: '#10b981', unit: 'W' },
  {
    value: 'frequency',
    label: 'Frequência (Hz)',
    color: '#f59e0b',
    unit: 'Hz',
  },
  {
    value: 'power_factor',
    label: 'Fator de Potência',
    color: '#8b5cf6',
    unit: '',
  },
]

const generateMockData = (type: MeasurementKey) => {
  const baseValues: Record<MeasurementKey, number> = {
    voltage: 220,
    current: 10,
    power: 2200,
    frequency: 60,
    power_factor: 0.95,
  }

  const base = baseValues[type]

  return Array.from({ length: 20 }, (_, i) => ({
    time: `${i}:00`,
    value: base + (Math.random() - 0.5) * base * 0.1,
  }))
}

function RouteComponent() {
  const { data: meter } = Route.useLoaderData()
  const { charts: chartsParams } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { meterId } = Route.useParams()

  const handleRemoveChart = (chartId: string) => {
    const newCharts = chartsParams?.filter(
      (c) => `${c.meterId}-${c.measurement}` !== chartId
    )
    navigate({
      search: (prev) => ({ ...prev, charts: newCharts }),
      replace: true,
    })
  }

  const charts = chartsParams
    ? chartsParams
        .filter((p) => p.meterId === meterId)
        .map((chartParam) => {
          const measurement = measurementTypes.find(
            (m) => m.value === chartParam.measurement
          )
          if (!(measurement && meter)) {
            return null
          }

          return {
            id: `${chartParam.meterId}-${chartParam.measurement}`,
            meterId: chartParam.meterId,
            meterName: meter.description ?? `Medidor ${meter.ip}`,
            measurementType: chartParam.measurement,
            measurementLabel: measurement.label,
            color: measurement.color,
            unit: measurement.unit,
            data: generateMockData(chartParam.measurement),
          }
        })
    : []

  if (!meter) {
    return <div>Medidor não encontrado</div>
  }

  return (
    <ChartsList
      charts={charts.filter(Boolean)}
      onRemoveChart={handleRemoveChart}
    />
  )
}
