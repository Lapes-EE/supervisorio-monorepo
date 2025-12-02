import { Activity } from 'lucide-react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { chartsSchema } from '../-types'
import { ChartCard } from './chart-card'

export function ChartsList({
  charts,
  onRemoveChart,
}: {
  charts: chartsSchema[]
  onRemoveChart: (id: string) => void
}) {
  if (charts.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia className="size-12" variant="icon">
            <Activity />
          </EmptyMedia>
          <EmptyTitle>Nenhum gráfico adicionado</EmptyTitle>
          <EmptyDescription>
            Selecione um medidor e um tipo de medição acima para começar a
            visualizar os dados
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {charts.map((chart) => (
        <ChartCard chart={chart} key={chart?.id} onRemove={onRemoveChart} />
      ))}
    </div>
  )
}
