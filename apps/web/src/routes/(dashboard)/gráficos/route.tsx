import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/shadcn-io/combobox"
import type { GetMeters200Item } from "@/http/gen/model/get-meters200-item"
import { ChartsGrid } from "./-components/charts-grid"
import { KpiGrid } from "./-components/kpi-grid"
import { PeriodSelector } from "./-components/period-selector"
import { useTelemetryData } from "./-hooks/use-telemetry-data"
import { dashboardSearchSchema } from "./-types"

export const Route = createFileRoute("/(dashboard)/gráficos")({
  component: RouteComponent,
  validateSearch: dashboardSearchSchema,
  loader: ({ context }) => {
    const metersOptions = context.meters.map((meter: GetMeters200Item) => ({
      value: meter.id.toString(),
      label: meter.description ?? `Medidor ${meter.ip}`,
    }))
    return { metersOptions }
  },
})

function RouteComponent() {
  const { metersOptions } = Route.useLoaderData()
  const { meterId, period } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { data: telemetryData, isLoading } = useTelemetryData(
    meterId ? Number(meterId) : undefined,
    period
  )

  const handleMeterSelect = (selectedMeterId: string) => {
    navigate({
      search: (prev) => ({ ...prev, meterId: selectedMeterId || undefined }),
    })
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Gráficos</CardTitle>
          <CardDescription>
            Visualize indicadores e gráficos temporais dos medidores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label className="font-medium text-sm">Medidor</Label>
              <Combobox
                data={metersOptions}
                onValueChange={handleMeterSelect}
                type="medidor"
              >
                <ComboboxTrigger className="w-full" />
                <ComboboxContent className="w-full">
                  <ComboboxInput placeholder="Buscar medidor..." />
                  <ComboboxEmpty>Nenhum medidor encontrado.</ComboboxEmpty>
                  <ComboboxList>
                    <ComboboxGroup>
                      {metersOptions.map((meter) => (
                        <ComboboxItem
                          className="cursor-pointer py-3"
                          key={meter.value}
                          value={meter.value}
                        >
                          <div className="flex w-full flex-col gap-1">
                            <span className="font-medium text-base leading-tight">
                              {meter.label}
                            </span>
                          </div>
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-sm">Período</Label>
              <PeriodSelector />
            </div>
          </div>
        </CardContent>
      </Card>

      {meterId ? null : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Selecione um medidor para visualizar os gráficos
            </p>
          </CardContent>
        </Card>
      )}

      {meterId && isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {meterId && !isLoading ? (
        <>
          <div>
            <h2 className="mb-4 font-semibold text-lg">Indicadores</h2>
            <KpiGrid data={telemetryData} isLoading={isLoading} />
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-lg">Gráficos</h2>
            <ChartsGrid data={telemetryData} isLoading={isLoading} />
          </div>
        </>
      ) : null}
    </div>
  )
}
