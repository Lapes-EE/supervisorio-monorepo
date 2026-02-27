import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period.gen'

const periodLabels: Record<GetTelemetryPeriod, string> = {
  last_5_minutes: 'Últimos 5 minutos',
  last_30_minutes: 'Últimos 30 minutos',
  last_hour: 'Última hora',
  last_6_hours: 'Últimas 6 horas',
  last_12_hours: 'Últimas 12 horas',
  last_24_hours: 'Últimas 24 horas',
  last_7_days: 'Últimos 7 dias',
  this_month: 'Este mês',
  last_30_days: 'Últimos 30 dias',
  this_year: 'Este ano',
  today: 'Hoje',
}

interface PeriodSelectorProps {
  value: GetTelemetryPeriod
  onChange: (value: GetTelemetryPeriod) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(periodLabels).map(([period, label]) => (
          <SelectItem key={period} value={period}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
