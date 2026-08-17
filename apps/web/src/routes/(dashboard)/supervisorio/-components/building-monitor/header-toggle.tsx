import { Link, useNavigate, useSearch } from '@tanstack/react-router'
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
  const { type, phase } = useSearch({ from: '/(dashboard)/supervisorio/' })
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
    <Card className="flex items-center justify-center gap-4 px-4 py-2">
      <Select onValueChange={handleTypeChange} value={type}>
        <SelectTrigger className="w-[240px]">
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
                  checked={Array.isArray(phase) ? phase.includes(fase) : false}
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
    </Card>
  )
}
