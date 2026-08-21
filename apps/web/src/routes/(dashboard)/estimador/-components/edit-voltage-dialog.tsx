import { Check, RotateCcw, Sliders } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { LastMeasurementData } from './data'

interface EditVoltageDialogProps {
  meter: LastMeasurementData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (meterId: number, voltage: number) => void
  onClear: (meterId: number) => void
}

interface DialogContentProps {
  meter: LastMeasurementData
  onOpenChange: (open: boolean) => void
  onSave: (meterId: number, voltage: number) => void
  onClear: (meterId: number) => void
}

function EditVoltageDialogContent({
  meter,
  onOpenChange,
  onSave,
  onClear,
}: DialogContentProps) {
  const currentVal =
    meter.tensaoFaseNeutroC !== null ? String(meter.tensaoFaseNeutroC) : '220.0'
  const [inputValue, setInputValue] = useState(currentVal)

  const handleApply = () => {
    const num = Number.parseFloat(inputValue)
    if (!Number.isNaN(num)) {
      onSave(meter.meterId, num)
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
          <Sliders className="h-5 w-5 text-chart-4" />
          Injetar Erro Manual - {meter.name}
        </DialogTitle>
        <DialogDescription>
          Altere a tensão medida da Fase C para testar como o estimador de
          estado filtra e responde à anomalia.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="voltage">Tensão Medida (V)</Label>
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              className="font-mono text-base"
              id="voltage"
              max="500"
              min="0"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApply()
                }
              }}
              step="0.1"
              type="number"
              value={inputValue}
            />
            <span className="font-medium text-muted-foreground text-sm">V</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">
            Ajustes rápidos:
          </Label>
          <div className="flex flex-wrap gap-1.5">
            <Button
              onClick={() => handlePreset(-10)}
              size="sm"
              type="button"
              variant="secondary"
            >
              -10 V
            </Button>
            <Button
              onClick={() => handlePreset(10)}
              size="sm"
              type="button"
              variant="secondary"
            >
              +10 V
            </Button>
            <Button
              onClick={() => handlePreset(-20)}
              size="sm"
              type="button"
              variant="secondary"
            >
              -20 V
            </Button>
            <Button
              onClick={() => handlePreset(20)}
              size="sm"
              type="button"
              variant="secondary"
            >
              +20 V
            </Button>
            <Button
              onClick={() => handleDirectPreset(240)}
              size="sm"
              type="button"
              variant="outline"
            >
              240 V
            </Button>
            <Button
              onClick={() => handleDirectPreset(190)}
              size="sm"
              type="button"
              variant="outline"
            >
              190 V
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        {meter.isOverridden && (
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
        )}
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
            className="gap-1.5 bg-chart-4 text-white hover:bg-chart-4/90"
            onClick={handleApply}
            size="sm"
            type="button"
          >
            <Check className="h-4 w-4" />
            Aplicar Erro
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
  onSave,
  onClear,
}: EditVoltageDialogProps) {
  if (!meter) {
    return null
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <EditVoltageDialogContent
        meter={meter}
        onClear={onClear}
        onOpenChange={onOpenChange}
        onSave={onSave}
      />
    </Dialog>
  )
}
