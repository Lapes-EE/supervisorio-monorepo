import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { isIP } from 'is-ip'
import { useState } from 'react'
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
  DialogTrigger,
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
import { usePostMeters } from '@/http/gen/endpoints/lapes-api.gen'

const formCreatemeterSchema = z.object({
  name: z.string().min(1, 'O nome do medidor é requerido'),
  ip: z
    .string()
    .min(1, 'O IP do medidor é requerido')
    .refine((val) => isIP(val), {
      error: 'IP inválido',
    }),
  description: z.string().optional(),
})

export function TelemetryForm() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { queryClient } = useRouteContext({ from: '/(dashboard)/telemetria' })
  const mutation = usePostMeters({
    axios: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  })
  const form = useForm<z.infer<typeof formCreatemeterSchema>>({
    resolver: zodResolver(formCreatemeterSchema),
    defaultValues: {
      description: '',
      ip: '',
      name: '',
    },
  })

  function onSubmit(data: z.infer<typeof formCreatemeterSchema>) {
    mutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['Meters'] })
          form.reset()
          setOpen(false)
        },
        onError: (error) => {
          toast('Erro ao adicionar medidor', {
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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild className="col-span-4">
        <Button variant="outline">Cadastrar Medidor</Button>
      </DialogTrigger>
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
