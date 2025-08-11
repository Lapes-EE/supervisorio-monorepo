import { useState } from 'react'
import { BuildingLayout } from './building-layout'
import { HeaderToggle } from './header-toggle'
import { SensorDetailsModal } from './sensor-details-modal'
import { SensorsLegend } from './sensors-legend'
import type { Sensor } from './types'

export function BuildingMonitor() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <HeaderToggle />
      <BuildingLayout onSensorClick={setSelectedSensor} />
      <SensorsLegend />
      <SensorDetailsModal
        onClose={() => setSelectedSensor(null)}
        sensor={selectedSensor}
      />
    </div>
  )
}
