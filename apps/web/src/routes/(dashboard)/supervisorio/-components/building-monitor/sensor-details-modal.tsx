import NumberFlow from "@number-flow/react"
import { Link, useSearch } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { ToggleSearchSchema } from "../../-types"
import { getPhaseLabels } from "./constants"
import { SelectPeriod } from "./period-select"
import { SensorChart } from "./sensor-chart"
import type { Sensor } from "./types"

interface SensorDetailsModalProps {
  onClose: () => void
  sensor: Sensor | null
}

export function SensorDetailsModal({
  sensor,
  onClose,
}: SensorDetailsModalProps) {
  const search = useSearch({ strict: false }) as ToggleSearchSchema
  const phaseLabels = getPhaseLabels(search.type)
  return (
    <Dialog onOpenChange={onClose} open={!!sensor}>
      <DialogContent className="max-w-2xl">
        {sensor ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {sensor.name}
              </DialogTitle>
              <DialogDescription>
                {sensor.description} • Última atualização: {sensor.lastUpdate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex w-full items-center justify-between gap-2 font-bold text-3xl">
                    <div className="flex flex-col">
                      {phaseLabels.map((label, idx) => {
                        const colorVar = [
                          "var(--chart-1)",
                          "var(--chart-2)",
                          "var(--chart-3)",
                        ][idx % 3]
                        return (
                          <div className="flex items-center gap-2" key={label}>
                            <Label
                              className="font-bold text-2xl"
                              style={{ color: colorVar }}
                            >
                              {label}:
                            </Label>
                            <NumberFlow
                              className="font-bold text-2xl"
                              format={{ minimumFractionDigits: 2 }}
                              suffix={` ${sensor.unit}`}
                              value={sensor.value[idx]}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex gap-2 font-semibold text-lg">
                  <p>Histórico</p>
                  <SelectPeriod />
                </h4>
                <SensorChart sensor={sensor} />
              </div>

              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link
                    search={{
                      meterId: sensor.id.toString(),
                      period: "last_24_hours",
                    }}
                    to="/gráficos"
                  >
                    Visualização Estendida
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  <Link
                    params={{ meterId: sensor.id.toString() }}
                    search={{ charts: {} }}
                    to="/settings/$meterId"
                  >
                    Configurar Alarmes
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  Exportar Dados
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
