import type { QueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GetTelemetryPeriod } from '@/http/gen/model/get-telemetry-period.gen'
import type { ToggleSearchSchema } from '../../-types'

interface SelectPeriodProps {
  queryClient: QueryClient
  search: ToggleSearchSchema
}

export function SelectPeriod({ queryClient, search }: SelectPeriodProps) {
  const period = search.period

  const navigate = useNavigate()
  const periodLabels: Record<string, string> = {
    last_5_minutes: 'Últimos 5 minutos',
    last_30_minutes: 'Últimos 30 minutos',
    last_hour: 'Última hora',
    last_6_hours: 'Últimas 6 horas',
    last_12_hours: 'Últimas 12 horas',
    last_24_hours: 'Últimas 24 horas',
    today: 'Hoje',
    last_7_days: 'Últimos 7 dias',
    this_month: 'Este mês',
    last_30_days: 'Últimos 30 dias',
    this_year: 'Este ano',
  }

  const handleChange = (value: GetTelemetryPeriod) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, period: value }) })
    queryClient.invalidateQueries({ queryKey: ['Sensors'] })
  }

  return (
    <Select onValueChange={handleChange} value={period}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Períodos</SelectLabel>
          {Object.values(GetTelemetryPeriod).map((periodKey) => (
            <SelectItem key={periodKey} value={periodKey}>
              {periodLabels[periodKey] ?? periodKey}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
