import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePostSessionsPassword } from '@/http/gen/endpoints/lapes-api.gen'

export const Route = createFileRoute('/login/')({
  component: LoginComponent,
})

const loginSchema = z.object({
  username: z.string('Usuário inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

function LoginComponent() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const mutation = usePostSessionsPassword()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof loginSchema>) {
    mutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          const token = response.data.token
          localStorage.setItem('token', token)
          toast('Login bem-sucedido!')
          navigate({ to: '/telemetria' })
        },
        onError: (error) => {
          toast('Erro ao fazer login', {
            description: error.message,
          })
        },
      }
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-lg">
        <h1 className="mb-6 text-center font-bold text-2xl">Login</h1>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="Usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="******"
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      className="-translate-y-1/2 absolute top-1/2 right-2"
                      onClick={() => setShowPassword(!showPassword)}
                      size="icon"
                      type="button"
                      variant="link"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Entrar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
