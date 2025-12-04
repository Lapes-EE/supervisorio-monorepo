import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
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

export const Route = createFileRoute('/(dashboard)/settings')({
  component: RouteComponent,
  loader: ({ context }) => {
    const response = context.meters
    const metersOptions = response.map((meter) => ({
      value: meter.id.toString(),
      label: meter.description ?? `Medidor ${meter.ip} sem descrição`,
    }))
    return metersOptions
  },
})

function RouteComponent() {
  const meters = Route.useLoaderData()
  const navigate = useNavigate()

  function onMeterSelect(valueSelected: string) {
    navigate({ to: '/settings/$meterId', params: { meterId: valueSelected } })
  }

  return (
    <>
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4 space-y-2">
          <h2 className="font-semibold text-2xl">Selecione um Medidor</h2>
          <p className="text-muted-foreground text-sm">
            Escolha o medidor para configurar
          </p>
        </div>

        <Combobox
          data={meters}
          onValueChange={(newValue) => onMeterSelect(newValue)}
          type="medidor"
        >
          <ComboboxTrigger className="min-h-14 w-full" />
          <ComboboxContent className="w-full">
            <ComboboxInput className="h-12" placeholder="Buscar medidor..." />
            <ComboboxEmpty>Nenhum medidor encontrado.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxGroup>
                {meters.map((meter) => (
                  <ComboboxItem
                    className="min-h-16 cursor-pointer py-3"
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
      <Outlet />
    </>
  )
}
