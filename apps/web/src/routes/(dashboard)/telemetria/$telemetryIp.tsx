import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getTelemetryIp } from '@/http/gen/endpoints/lapes-api.gen'
import PhasorChart, {
  type Phasor,
} from '@/routes/(dashboard)/telemetria/-components/phasor-chart'
import { ApparentPowerCard } from './-components/apparent-power-card'
import { CurrentCard } from './-components/current-card'
import { FundamentalActivePowerCard } from './-components/fundamental-active-power-card'
import { HarmonicActivePowerCard } from './-components/harmonic-active-power-card'
import { PhaseNeutralVoltageCard } from './-components/phase-neutral-voltage-card'
import { PhasePhaseVoltageCard } from './-components/phase-phase-voltage-card'
import { PowerFactorCard } from './-components/power-factor-card'
import { ReactivePowerCard } from './-components/reactive-power-card'
import { TemperatureCard } from './-components/temperature-card'
import { TotalActivePowerCard } from './-components/total-active-power-card'

export const Route = createFileRoute('/(dashboard)/telemetria/$telemetryIp')({
  component: Dashboard,
  errorComponent: ({ error }) => (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{error.message}</AlertTitle>
      <AlertDescription>
        <p>Por favor, verifique se todos os apps estão rodando</p>
        <ul className="list-inside list-disc text-sm">
          <li>Banco de dados está rodando?</li>
          <li>A API está rodando?</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
  loader: async ({ params }) => {
    const result = await getTelemetryIp(params.telemetryIp)
    return result.data
  },
})

function Dashboard() {
  const data = Route.useLoaderData
  const { telemetryIp } = Route.useParams()
  const {
    data: telemetryData,
    isLoading: telemetryDataIsLoading,
    isError,
  } = useQuery({
    queryKey: ['Telemetry', telemetryIp],
    initialData: data,
    queryFn: async () => {
      const result = await getTelemetryIp(telemetryIp)
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
    <div className="space-y-4">
      {/* Tensões e Correntes */}
      <div className="rounded-md border p-4">
        <h2 className="mb-4 font-semibold text-lg">Tensões e correntes</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <PhasorChart phasors={phasors} telemetryData={telemetryData} />
          </div>
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
          <div className="lg:col-span-2">
            {/* <ImbalanceCard
              isLoading={telemetryDataIsLoading}
              telemetryData={telemetryData}
            /> */}
          </div>
        </div>
      </div>

      {/* Potências */}
      <div className="rounded-md border p-4">
        <h2 className="mb-4 font-semibold text-lg">Potências</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <ApparentPowerCard
            isLoading={telemetryDataIsLoading}
            telemetryData={telemetryData}
          />
          <ReactivePowerCard
            isLoading={telemetryDataIsLoading}
            telemetryData={telemetryData}
          />
        </div>
      </div>

      {/* Fator de potência e temperatura */}
      <div className="rounded-md border p-4">
        <h2 className="mb-4 font-semibold text-lg">
          Fator de potência e temperatura
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PowerFactorCard
            isLoading={telemetryDataIsLoading}
            telemetryData={telemetryData}
          />
          <TemperatureCard
            isLoading={telemetryDataIsLoading}
            telemetryData={telemetryData}
          />
        </div>
      </div>
    </div>
  )
}
