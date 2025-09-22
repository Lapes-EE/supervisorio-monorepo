import {
  createFileRoute,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteMetersId } from '@/http/gen/endpoints/lapes-api.gen'

export const Route = createFileRoute('/(dashboard)/telemetria/$meterId/delete')(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const navigate = useNavigate()
  const { meterId } = Route.useParams()
  const { queryClient } = useRouteContext({ from: '/(dashboard)/telemetria' })
  const mutation = useDeleteMetersId({
    axios: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  })

  function handleDeleteMeter() {
    mutation.mutate(
      { id: Number(meterId) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['Meters'] })
        },
        onError(error) {
          toast('Erro ao deletar', {
            description: `${error.response?.data}, é necessário estar logado`,
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
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) {
          navigate({
            to: '/telemetria',
            from: '/telemetria',
          })
        }
      }}
      open={true}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá excluir permanentemente o
            medidor e remover seus dados dos nossos servidores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteMeter}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
