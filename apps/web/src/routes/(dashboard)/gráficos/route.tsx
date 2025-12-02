import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/shadcn-io/combobox'
import { chartsSearchSchema } from './-types'

export const Route = createFileRoute('/(dashboard)/gráficos')({
  component: RouteComponent,
  validateSearch: chartsSearchSchema,
  loader: ({ context }) => {
    const metersOptions = context.meters.map((meter) => ({
      value: meter.id.toString(),
      label: meter.description ?? `Medidor ${meter.ip} sem descrição`,
    }))
    return { metersOptions }
  },
})

function RouteComponent() {
  const { metersOptions } = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })

  const handleMeterSelect = (selectedMeterId: string) => {
    if (selectedMeterId) {
      navigate({
        to: '/gráficos/$meterId',
        params: { meterId: selectedMeterId },
        search: true, // preserve existing search params
      })
    }
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Seleção de Gráficos</CardTitle>
          <CardDescription>
            Escolha o medidor que deseja visualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="font-medium text-sm">Medidor</Label>
            <Combobox
              data={metersOptions}
              onValueChange={handleMeterSelect}
              type="medidor"
            >
              <ComboboxTrigger className=" w-full" />
              <ComboboxContent className="w-full">
                <ComboboxInput placeholder="Buscar medidor..." />
                <ComboboxEmpty>Nenhum medidor encontrado.</ComboboxEmpty>
                <ComboboxList>
                  <ComboboxGroup>
                    {metersOptions.map((meter) => (
                      <ComboboxItem
                        className=" cursor-pointer py-3"
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
        </CardContent>
      </Card>

      <Outlet />
    </div>
  )
}
