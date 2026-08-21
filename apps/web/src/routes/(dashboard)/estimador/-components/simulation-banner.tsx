import { FlaskConical, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface SimulationBannerProps {
  overridesCount: number
  onReset: () => void
}

export function SimulationBanner({
  overridesCount,
  onReset,
}: SimulationBannerProps) {
  if (overridesCount === 0) {
    return null
  }

  return (
    <Alert className="mb-6 border-chart-4/50 bg-chart-4/10">
      <FlaskConical className="h-5 w-5 text-chart-4" />
      <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <AlertTitle className="font-semibold text-chart-4">
            Modo Simulação Ativo
          </AlertTitle>
          <AlertDescription className="text-muted-foreground text-sm">
            {overridesCount === 1
              ? '1 medidor com erro manual injetado.'
              : `${overridesCount} medidores com erros manuais injetados.`}{' '}
            As atualizações automáticas estão pausadas para análise de estado.
          </AlertDescription>
        </div>
        <Button
          className="w-fit shrink-0 gap-1.5 border-chart-4/40 hover:bg-chart-4/20"
          onClick={onReset}
          size="sm"
          variant="outline"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar Medições Reais
        </Button>
      </div>
    </Alert>
  )
}
