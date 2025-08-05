import { createFileRoute, redirect } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/')({
  component: Dashboard,
  beforeLoad: () => {
    throw redirect({ to: '/supervisorio' })
  },
})

function Dashboard() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <main>supervisório</main>
      <Separator className="my-4" />
      <footer>Alarmes</footer>
    </div>
  )
}
