import { X } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { chartsSchema } from '../-types'

export function ChartCard({
  chart,
  onRemove,
}: {
  chart: chartsSchema
  onRemove: (id: string) => void
}) {
  if (!chart) {
    return
  }
  return (
    <Card key={chart.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {chart.measurementLabel}
              <Badge variant="outline">{chart.meterName}</Badge>
            </CardTitle>
            <CardDescription>Últimas 20 leituras do medidor</CardDescription>
          </div>
          <Button
            onClick={() => onRemove(chart.id)}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer height={300} width="100%">
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" style={{ fontSize: '12px' }} />
            <YAxis
              label={{
                value: chart.unit,
                angle: -90,
                position: 'insideLeft',
              }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              formatter={(value: number) => [
                `${Number(value).toFixed(2)} ${chart.unit}`,
                chart.measurementLabel,
              ]}
            />
            <Legend />
            <Line
              dataKey="value"
              dot={false}
              name={chart.measurementLabel}
              stroke={chart.color}
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
