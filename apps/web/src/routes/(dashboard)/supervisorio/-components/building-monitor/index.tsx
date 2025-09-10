import type { QueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { ToggleSearchSchema } from '../../-types'
import { BuildingLayout } from './building-layout'
import { HeaderToggle } from './header-toggle'
import { SensorDetailsModal } from './sensor-details-modal'
import { SensorsLegend } from './sensors-legend'
import type { Sensor } from './types'

interface BuildingMonitorProps {
  search: ToggleSearchSchema
  queryClient: QueryClient
}

export function BuildingMonitor({ search, queryClient }: BuildingMonitorProps) {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)

  return (
    <div className="flex h-full w-full flex-col">
      <HeaderToggle />
      <div className="my-4">
        <BuildingLayout
          onSensorClick={setSelectedSensor}
          queryClient={queryClient}
          search={search}
        />
      </div>
      <SensorsLegend />
      <SensorDetailsModal
        onClose={() => setSelectedSensor(null)}
        queryClient={queryClient}
        search={search}
        sensor={selectedSensor}
      />
    </div>
  )
}
