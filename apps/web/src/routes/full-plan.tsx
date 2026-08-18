import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect, useRef, useState } from 'react'
import { useEventSource } from '@/hooks/use-event-source'
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
  useEventSource()
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
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

      indexRef.current = (indexRef.current + 1) % typeOption.length
    }, 5000)

    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="h-full w-full px-2">
      <BuildingLayout onSensorClick={setSelectedSensor} />
      <SensorDetailsModal
        onClose={() => setSelectedSensor(null)}
        sensor={selectedSensor}
      />
    </div>
  )
}
