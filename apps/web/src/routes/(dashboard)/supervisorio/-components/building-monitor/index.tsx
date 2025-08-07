import { useState } from 'react'
import { BuildingLayout } from './building-layout'
import { SensorDetailsModal } from './sensor-details-modal'
import { SensorsLegend } from './sensors-legend'
import type { Sensor } from './types'

export function BuildingMonitor() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)

  return (
    <div className="h-full w-full">
      <BuildingLayout onSensorClick={setSelectedSensor} />
      <SensorsLegend />
      <SensorDetailsModal
        onClose={() => setSelectedSensor(null)}
        sensor={selectedSensor}
      />
    </div>
  )
}
