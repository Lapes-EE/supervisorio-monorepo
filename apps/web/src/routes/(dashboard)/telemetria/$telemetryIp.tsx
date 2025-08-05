import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-scada-api.gen'
import PhasorChart, {
  type Phasor,
} from '@/routes/(dashboard)/telemetria/-components/phasor-chart'
import { CurrentCard } from './-components/current-card'
import { FrequencyCard } from './-components/frequency-card'
import { FundamentalActivePowerCard } from './-components/fundamental-active-power-card'
import { HarmonicActivePowerCard } from './-components/harmonic-active-power-card'
import { PhaseAngleCard } from './-components/phase-angle-card'
import { PhaseNeutralVoltageCard } from './-components/phase-neutral-voltage-card'
import { PhasePhaseVoltageCard } from './-components/phase-phase-voltage-card'
import { TotalActivePowerCard } from './-components/total-active-power-card'

export const Route = createFileRoute('/(dashboard)/telemetria/$telemetryIp')({
  component: Dashboard,
  errorComponent: ({ error }) => (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{error.message}</AlertTitle>
      <AlertDescription>
        <p>Please verify your billing information and try again.</p>
        <ul className="list-inside list-disc text-sm">
          <li>Check your card details</li>
          <li>Ensure sufficient funds</li>
          <li>Verify billing address</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery({
      queryKey: ['Telemetry', params.telemetryIp],
      queryFn: async () => {
        const result = await getMetersGetTelemetryIp(params.telemetryIp)
        return result.data
      },
    })
  },
})

function Dashboard() {
  const { telemetryIp } = Route.useParams()
  const {
    data: telemetryData,
    isLoading: telemetryDataIsLoading,
    isError,
  } = useQuery({
    queryKey: ['Telemetry', telemetryIp],
    queryFn: async () => {
      const result = await getMetersGetTelemetryIp(telemetryIp)
      return result.data
    },
    refetchInterval: 1000 * 2, // 2 Segundos
    retry: 0,
  })

  if (isError) {
    throw new Error('Não foi possível acessar o medidor')
  }

  const phasors: Phasor[] = [
    {
      name: 'Tensão - Fase A',
      angle: telemetryData?.angulo_fase_a,
      magnitude: 1,
      color: 'var(--chart-1)',
      label: `${telemetryData?.angulo_fase_a.toFixed(0)}°`,
    },
    {
      name: 'Tensão - Fase B',
      angle: telemetryData?.angulo_fase_b,
      magnitude: 1,
      color: 'var(--chart-2)',
      label: `${telemetryData?.angulo_fase_b.toFixed(0)}°`,
    },
    {
      name: 'Tensão - Fase C',
      angle: telemetryData?.angulo_fase_c,
      magnitude: 1,
      color: 'var(--chart-3)',
      label: `${telemetryData?.angulo_fase_c.toFixed(0)}°`,
    },
    {
      name: 'Corrente - Fase A',
      angle:
        telemetryData &&
        telemetryData?.angulo_fase_a + telemetryData?.phi_fase_a,
      magnitude: 0.5,
      color: 'var(--chart-4)',
      label: `${telemetryData && (telemetryData?.angulo_fase_a + telemetryData?.phi_fase_a).toFixed(0)}°`,
    },
    {
      name: 'Corrente - Fase B',
      angle:
        telemetryData &&
        telemetryData?.angulo_fase_b + telemetryData?.phi_fase_b,
      magnitude: 0.5,
      color: 'var(--chart-5)',
      label: `${telemetryData && (telemetryData?.angulo_fase_b + telemetryData?.phi_fase_b).toFixed(0)}°`,
    },
    {
      name: 'Corrente - Fase C',
      angle:
        telemetryData &&
        telemetryData?.angulo_fase_c + telemetryData?.phi_fase_c,
      magnitude: 0.5,
      color: 'var(--chart-6)',
      label: `${telemetryData && (telemetryData?.angulo_fase_c + telemetryData?.phi_fase_c).toFixed(0)}°`,
    },
  ]

  return (
    <div className="space-y-4 rounded-md border p-4">
      {/* Parte superior */}
      <div className="grid grid-cols-3 gap-4">
        {/* Coluna 1 - Fasores */}
        <div className="col-span-2 row-span-2">
          <PhasorChart phasors={phasors} />
        </div>

        {/* Coluna 2 - Frequência */}
        <FrequencyCard telemetryData={telemetryData} />

        {/* Coluna 2 - Ângulos */}
        <PhaseAngleCard
          isLoading={telemetryDataIsLoading}
          telemetryData={telemetryData}
        />
      </div>

      {/* Grid inferior */}
      <div className="grid grid-cols-3 gap-4">
        <PhaseNeutralVoltageCard
          isLoading={telemetryDataIsLoading}
          telemetryData={telemetryData}
        />
        <PhasePhaseVoltageCard
          isLoading={telemetryDataIsLoading}
          telemetryData={telemetryData}
        />
        <CurrentCard
          isLoading={telemetryDataIsLoading}
          telemetryData={telemetryData}
        />
        <TotalActivePowerCard
          isLoading={telemetryDataIsLoading}
          telemetryData={telemetryData}
        />
        <FundamentalActivePowerCard
          isLoading={telemetryDataIsLoading}
          telemetryData={telemetryData}
        />
        <HarmonicActivePowerCard
          isLoading={telemetryDataIsLoading}
          telemetryData={telemetryData}
        />
      </div>
    </div>
  )
}
