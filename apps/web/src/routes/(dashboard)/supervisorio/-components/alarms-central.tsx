import { Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AlarmsCentral() {
  const activeAlarms = 3
  const criticalAlarms = 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center font-bold text-2xl text-gray-900 dark:text-white">
          <AlertTriangle className="mr-2 h-6 w-6 text-red-600" />
          Central de Alarmes
        </h2>
        <div className="flex space-x-2">
          <Badge variant="destructive">
            {criticalAlarms} Crítico{criticalAlarms !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary">
            {activeAlarms - criticalAlarms} Ativo
            {activeAlarms - criticalAlarms !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alarme Crítico - Temperatura Alta</AlertTitle>
          <AlertDescription>
            Sensor de temperatura do equipamento #3 registrou 85°C (limite:
            80°C).
            <span className="mt-1 block text-xs opacity-75">
              Detectado há 5 minutos - Setor: Produção A
            </span>
          </AlertDescription>
        </Alert>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Aviso - Manutenção Programada</AlertTitle>
          <AlertDescription>
            Manutenção preventiva agendada para equipamento #7 em 2 horas.
            <span className="mt-1 block text-xs opacity-75">
              Agendado há 1 dia - Setor: Utilidades
            </span>
          </AlertDescription>
        </Alert>

        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>Informação - Backup Concluído</AlertTitle>
          <AlertDescription>
            Backup automático dos dados do sistema concluído com sucesso.
            <span className="mt-1 block text-xs opacity-75">
              Concluído há 30 minutos - Sistema
            </span>
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline">Ver Todos os Alarmes</Button>
      </div>
    </div>
  )
}
