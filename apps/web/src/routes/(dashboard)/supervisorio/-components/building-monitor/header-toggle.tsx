import { Link, useSearch } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { toggleSearchSchema } from '../../-types'

export function HeaderToggle() {
  const { type, phase } = useSearch({ from: '/(dashboard)/supervisorio/' })
  const phaseOptions = toggleSearchSchema.shape.phase.def.defaultValue

  // Função para toggle da fase
  const togglePhase = (faseToToggle: 'A' | 'B' | 'C') => {
    const currentPhases = phase || []

    if (currentPhases.includes(faseToToggle)) {
      // Se já está selecionada, remove
      return currentPhases.filter((f) => f !== faseToToggle)
    }
    // Se não está selecionada, adiciona
    return [...currentPhases, faseToToggle]
  }

  return (
    <Card className="flex items-center justify-center">
      <ToggleGroup type="single" value={type}>
        <ToggleGroupItem
          aria-label="Toggle voltage"
          asChild
          className="px-10"
          value="voltage"
        >
          <Link search={(prev) => ({ ...prev, type: 'voltage' })} to=".">
            Tensão
          </Link>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Toggle current"
          asChild
          className="px-10"
          value="current"
        >
          <Link search={(prev) => ({ ...prev, type: 'current' })} to=".">
            Corrente
          </Link>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Toggle power"
          asChild
          className="px-10"
          value="power"
        >
          <Link search={(prev) => ({ ...prev, type: 'power' })} to=".">
            Potência
          </Link>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Toggle frequency"
          asChild
          className="px-10"
          value="frequency"
        >
          <Link search={{ type: 'frequency' }} to="/supervisorio">
            Frequência
          </Link>
        </ToggleGroupItem>
      </ToggleGroup>

      <main className="flex gap-6">
        {phaseOptions.map((fase) => (
          <div className="flex items-center gap-2 px-4 py-2" key={fase}>
            <Link
              search={(prev) => ({ ...prev, phase: togglePhase(fase) })}
              to="."
            >
              <Checkbox
                checked={Array.isArray(phase) ? phase.includes(fase) : false}
                id={`fase-${fase}`}
              />
            </Link>
            <Label htmlFor={`fase-${fase}`}>{`Fase ${fase}`}</Label>
          </div>
        ))}
      </main>
    </Card>
  )
}
