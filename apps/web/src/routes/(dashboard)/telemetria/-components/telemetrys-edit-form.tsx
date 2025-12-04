import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { isIP } from 'is-ip'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePutMetersId } from '@/http/gen/endpoints/lapes-api.gen'
import type { GetMeters200Item } from '@/http/gen/model/get-meters200-item.gen'

const ISSO_SERIAL_REGEX = /^[A-Z0-9]{3}(?:-[A-Z0-9]{3}){3}$/

const formEditMeterSchema = z.object({
  name: z.string().min(1, 'O nome do medidor é requerido'),

  ip: z
    .string()
    .min(1, 'O IP do medidor é requerido')
    .refine((val) => isIP(val), {
      error: 'IP inválido',
    }),
  description: z.string().optional(),
  issoSerial: z
    .string()
    .min(1, 'Serial is required')
    .refine((val) => ISSO_SERIAL_REGEX.test(val), {
      message: 'Serial inválido. Formato esperado: 258-A17-39C-D6A',
    }),
})

interface TelemetryEditFormProps {
  meters: GetMeters200Item[]
  meterId: string
}

export function TelemetryEditForm({ meters, meterId }: TelemetryEditFormProps) {
  const { queryClient } = useRouteContext({
    from: '/(dashboard)/telemetria',
  })
  const mutation = usePutMetersId({
    axios: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  })
  const navigate = useNavigate()

  const meterIndex = meters.findIndex((m) => m.id.toString() === meterId)
  const meter = meterIndex !== -1 ? meters[meterIndex] : null

  const form = useForm<z.infer<typeof formEditMeterSchema>>({
    resolver: zodResolver(formEditMeterSchema),
    defaultValues: {
      name: meter?.name ?? '',
      ip: meter?.ip ?? '',
      description: meter?.description ?? '',
      issoSerial: meter?.issoSerial ?? '',
    },
  })

  function onSubmit(data: z.infer<typeof formEditMeterSchema>) {
    mutation.mutate(
      { id: Number(meterId), data },
      {
        onSuccess: () => {
          toast('Medidor editado com sucesso')
          form.reset()
          queryClient.invalidateQueries({ queryKey: ['Meters'] })
          navigate({
            to: '/telemetria',
            from: '/telemetria',
          })
        },
        onError: (error) => {
          toast('Erro ao editar', {
            description: `${error.response?.data.error}, é necessário estar logado`,
            action: {
              label: 'Login',
              onClick: () => navigate({ to: '/login' }),
            },
          })
        },
      }
    )
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          navigate({
            to: '/telemetria',
            from: '/telemetria',
          })
        }
      }}
      open
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar medidor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issoSerial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial medidor</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
