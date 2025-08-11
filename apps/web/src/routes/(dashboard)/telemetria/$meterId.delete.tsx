import {
  createFileRoute,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router'
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
  const mutation = useDeleteMetersId()

  function handleDeleteMeter() {
    mutation.mutate(
      { id: Number(meterId) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['Meters'] })
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
