import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router"
import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getTelemetry } from "@/http/gen/endpoints/lapes-api"
import type { GetTelemetry200DataItem } from "@/http/gen/model/get-telemetry200-data-item"
import PhasorChart, {
  type Phasor,
} from "@/routes/(dashboard)/telemetria/-components/phasor-chart"
import { ApparentPowerCard } from "./-components/apparent-power-card"
import { CurrentCard } from "./-components/current-card"
import { FundamentalActivePowerCard } from "./-components/fundamental-active-power-card"
import { HarmonicActivePowerCard } from "./-components/harmonic-active-power-card"
import { PhaseNeutralVoltageCard } from "./-components/phase-neutral-voltage-card"
import { PhasePhaseVoltageCard } from "./-components/phase-phase-voltage-card"
import { PowerFactorCard } from "./-components/power-factor-card"
import { ReactivePowerCard } from "./-components/reactive-power-card"
import { TemperatureCard } from "./-components/temperature-card"
import { TotalActivePowerCard } from "./-components/total-active-power-card"

export const Route = createFileRoute("/(dashboard)/telemetria/$meterId")({
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
    return await getTelemetry({
      meterId: Number(params.meterId),
      // biome-ignore lint/suspicious/noExplicitAny: needed for Orval types
      period: "last_measurement" as any,
    })
  },
})

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: legacy routing setup
export function Dashboard() {
  const data = Route.useLoaderData()
  const { meterId } = Route.useParams()
  const matches = useMatches()
  const leafRouteId = matches.at(-1)?.id

  const isModalRoute =
    leafRouteId === "/(dashboard)/telemetria/$meterId/edit" ||
    leafRouteId === "/(dashboard)/telemetria/$meterId/delete"

  const {
    data: telemetryResponse,
    isLoading: telemetryDataIsLoading,
    isError,
  } = useQuery({
    queryKey: ["Telemetry", meterId, "last_measurement"],
    initialData: data,
    queryFn: async () => {
      return await getTelemetry({
        meterId: Number(meterId),
        // biome-ignore lint/suspicious/noExplicitAny: needed for Orval types
        period: "last_measurement" as any,
      })
    },
    retry: 0,
  })

  if (isError) {
    throw new Error("Não foi possível acessar os dados do medidor")
  }

  const telemetryData = telemetryResponse?.data?.[0] as
    | GetTelemetry200DataItem
    | undefined

  const measurements = telemetryData?.measurements

  const phasors: Phasor[] = [
    {
      name: "Tensão - Fase A",
      angle: measurements?.anguloFaseA,
      magnitude: 1,
      color: "var(--chart-1)",
      label: `${measurements?.anguloFaseA?.toFixed(0)}°`,
    },
    {
      name: "Tensão - Fase B",
      angle: measurements?.anguloFaseB,
      magnitude: 1,
      color: "var(--chart-2)",
      label: `${measurements?.anguloFaseB?.toFixed(0)}°`,
    },
    {
      name: "Tensão - Fase C",
      angle: measurements?.anguloFaseC,
      magnitude: 1,
      color: "var(--chart-3)",
      label: `${measurements?.anguloFaseC?.toFixed(0)}°`,
    },
    {
      name: "Corrente - Fase A",
      angle:
        measurements &&
        (measurements?.anguloFaseA ?? 0) + (measurements?.phiFaseA ?? 0),
      magnitude: 0.5,
      color: "var(--chart-4)",
      label: `${measurements && ((measurements?.anguloFaseA ?? 0) + (measurements?.phiFaseA ?? 0)).toFixed(0)}°`,
    },
    {
      name: "Corrente - Fase B",
      angle:
        measurements &&
        (measurements?.anguloFaseB ?? 0) + (measurements?.phiFaseB ?? 0),
      magnitude: 0.5,
      color: "var(--chart-5)",
      label: `${measurements && ((measurements?.anguloFaseB ?? 0) + (measurements?.phiFaseB ?? 0)).toFixed(0)}°`,
    },
    {
      name: "Corrente - Fase C",
      angle:
        measurements &&
        (measurements?.anguloFaseC ?? 0) + (measurements?.phiFaseC ?? 0),
      magnitude: 0.5,
      color: "var(--chart-6)",
      label: `${measurements && ((measurements?.anguloFaseC ?? 0) + (measurements?.phiFaseC ?? 0)).toFixed(0)}°`,
    },
  ]

  if (isModalRoute) {
    return <Outlet />
  }

  return (
    <div className="space-y-4">
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

      <Outlet />
    </div>
  )
}
