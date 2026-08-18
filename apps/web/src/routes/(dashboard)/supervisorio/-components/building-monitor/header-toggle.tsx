import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ToggleSearchSchema } from '../../-types'
import { toggleSearchSchema } from '../../-types'
import { getPhaseLabels, isSingleValue, parameterGroups } from './constants'

export function HeaderToggle() {
  const search = useSearch({ from: '/(dashboard)/supervisorio/' })
  const { type, phase } = search
  const navigate = useNavigate()
  const phaseOptions = toggleSearchSchema.shape.phase.def.defaultValue
  const phaseLabels = getPhaseLabels(type)
  const hidePhases = isSingleValue(type)

  const togglePhase = (faseToToggle: 'A' | 'B' | 'C') => {
    const currentPhases = phase || []

    if (currentPhases.includes(faseToToggle)) {
      return currentPhases.filter((f) => f !== faseToToggle)
    }
    return [...currentPhases, faseToToggle]
  }

  const handleTypeChange = (value: string) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        type: value as ToggleSearchSchema['type'],
      }),
    })
  }

  return (
    <Card className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-8">
      <div />

      <div className="flex flex-col items-center gap-4">
        <Select onValueChange={handleTypeChange} value={type}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Selecione o parâmetro" />
          </SelectTrigger>
          <SelectContent>
            {parameterGroups.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {!hidePhases && (
          <div className="flex items-center gap-6">
            {phaseOptions.map((fase, idx) => (
              <div className="flex items-center gap-2" key={fase}>
                <Link
                  search={(prev) => ({
                    ...prev,
                    phase: togglePhase(fase),
                  })}
                  to="."
                >
                  <Checkbox
                    checked={
                      Array.isArray(phase) ? phase.includes(fase) : false
                    }
                    id={`fase-${fase}`}
                  />
                </Link>
                <Label htmlFor={`fase-${fase}`}>
                  {phaseLabels[idx] ?? `Fase ${fase}`}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link search={search} to="/full-plan">
            <Maximize className="mr-2 h-4 w-4" />
            Ver em Tela Cheia
          </Link>
        </Button>
      </div>
    </Card>
  )
}
