import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect, useRef, useState } from 'react'
import { BuildingLayout } from '@/routes/(dashboard)/supervisorio/-components/building-monitor/building-layout'
import { SensorDetailsModal } from '@/routes/(dashboard)/supervisorio/-components/building-monitor/sensor-details-modal'
import type { Sensor } from '@/routes/(dashboard)/supervisorio/-components/building-monitor/types'
import {
  toggleSearchSchema,
  typeOption,
} from './(dashboard)/supervisorio/-types'

export const Route = createFileRoute('/full-plan')({
  component: SupervisorioFullPlan,
  validateSearch: zodValidator(toggleSearchSchema),
})

function SupervisorioFullPlan() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const search = Route.useSearch()
  const { queryClient } = Route.useRouteContext()
  const navigate = useNavigate()

  // índice atual do ciclo
  const indexRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const nextType = typeOption[indexRef.current]

      navigate({
        to: '.',
        search: (prev) => ({
          ...prev,
          type: nextType,
        }),
      })

      // atualiza índice para o próximo valor
      indexRef.current = (indexRef.current + 1) % typeOption.length
    }, 5000) // troca a cada 5 segundos (ajuste se quiser)

    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="h-full w-full px-2">
      <BuildingLayout
        onSensorClick={setSelectedSensor}
        queryClient={queryClient}
        search={search}
      />
      <SensorDetailsModal
        onClose={() => setSelectedSensor(null)}
        queryClient={queryClient}
        search={search}
        sensor={selectedSensor}
      />
    </div>
  )
}
