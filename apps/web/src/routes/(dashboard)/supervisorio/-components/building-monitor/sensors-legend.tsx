import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SensorsLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Sensores de Energia - 14 Pontos de Monitoramento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <span className="text-sm">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
            <span className="text-sm">Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded-full bg-red-500" />
            <span className="text-sm">Crítico</span>
          </div>
        </div>
        <div className="mt-4 text-gray-600 text-sm dark:text-gray-400">
          <strong>Distribuição:</strong> 1° Andar (5 sensores) • 2° Andar (5
          sensores) • 3° Andar (3 sensores)
        </div>
      </CardContent>
    </Card>
  )
}
