import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period'

const periodLabels = {
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

export function PeriodSelector() {
  const { period } = useSearch({ from: '/(dashboard)/gráficos' })
  const navigate = useNavigate({ from: '/(dashboard)/gráficos' })

  const handlePeriodChange = (newPeriod: GetTelemetryPeriod) => {
    navigate({
      search: (prev) => ({ ...prev, period: newPeriod }),
    })
  }

  return (
    <Select onValueChange={handlePeriodChange} value={period}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(periodLabels).map(([periodKey, label]) => (
          <SelectItem key={periodKey} value={periodKey as GetTelemetryPeriod}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
