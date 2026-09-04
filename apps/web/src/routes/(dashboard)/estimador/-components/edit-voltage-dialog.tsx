import { Check, RotateCcw } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MeasurementOverride } from "@/http/estimation-api"
import type { LastMeasurementData } from "./data"
import { MEASURE_CONFIG, type MeasureTypeSearch } from "./types"

interface EditVoltageDialogProps {
  measureType: MeasureTypeSearch["type"]
  meter: LastMeasurementData | null
  onClear: (meterId: number) => void
  onOpenChange: (open: boolean) => void
  onSave: (override: MeasurementOverride) => void
  open: boolean
}

interface DialogContentProps {
  measureType: MeasureTypeSearch["type"]
  meter: LastMeasurementData
  onClear: (meterId: number) => void
  onOpenChange: (open: boolean) => void
  onSave: (override: MeasurementOverride) => void
}

function EditVoltageDialogContent({
  meter,
  onOpenChange,
  measureType,
  onSave,
  onClear,
}: DialogContentProps) {
  const config = MEASURE_CONFIG[measureType]
  const currentVal = meter[config.measuredKey]
  const [inputValue, setInputValue] = useState(
    currentVal === null ? "" : String(currentVal.toFixed(2))
  )

  const handleApply = () => {
    const value = Number.parseFloat(inputValue)
    if (Number.isFinite(value)) {
      onSave({ meterId: meter.meterId, [config.measuredKey]: value })
      onOpenChange(false)
    }
  }

  const handlePreset = (delta: number) => {
    const base = Number.parseFloat(inputValue) || 220
    const nextVal = Math.max(0, Number((base + delta).toFixed(1)))
    setInputValue(String(nextVal))
  }

  const handleDirectPreset = (val: number) => {
    setInputValue(String(val))
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Editar {config.label} - {meter.name}
        </DialogTitle>
        <DialogDescription>
          Altere o valor medido da Fase C para testar como o estimador de estado
          filtra e responde à anomalia.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="measurement-value">
            {config.label} Medida ({config.unit})
          </Label>
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              className="font-mono text-base"
              id="measurement-value"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApply()
                }
              }}
              step="any"
              type="number"
              value={inputValue}
            />
            <span className="font-medium text-muted-foreground text-sm">
              {config.unit}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-muted-foreground text-xs">
          Ajustes rápidos:
        </Label>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <Button
              onClick={() => handlePreset(-10)}
              size="sm"
              type="button"
              variant="outline"
            >
              -10 {config.unit}
            </Button>
            <Button
              onClick={() => handlePreset(10)}
              size="sm"
              type="button"
              variant="outline"
            >
              +10 {config.unit}
            </Button>
          </div>
          <div className="flex gap-1.5">
            {config.unit === "V" && (
              <>
                <Button
                  onClick={() => handleDirectPreset(240)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  240 {config.unit}
                </Button>
                <Button
                  onClick={() => handleDirectPreset(190)}
                  size="sm"
                  type="button"
                  variant="destructive"
                >
                  190 {config.unit}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        {meter.isOverridden ? (
          <Button
            className="text-destructive hover:text-destructive"
            onClick={() => {
              onClear(meter.meterId)
              onOpenChange(false)
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Restaurar Original
          </Button>
        ) : null}
        <div className="flex gap-2 sm:ml-auto">
          <Button
            onClick={() => onOpenChange(false)}
            size="sm"
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            className="gap-1.5 text-white"
            onClick={handleApply}
            size="sm"
            type="button"
          >
            <Check className="h-4 w-4" />
            Aplicar Valor
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  )
}

export function EditVoltageDialog({
  meter,
  open,
  onOpenChange,
  measureType,
  onSave,
  onClear,
}: EditVoltageDialogProps) {
  if (!meter) {
    return null
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <EditVoltageDialogContent
        key={`${meter.meterId}-${measureType}`}
        measureType={measureType}
        meter={meter}
        onClear={onClear}
        onOpenChange={onOpenChange}
        onSave={onSave}
      />
    </Dialog>
  )
}
