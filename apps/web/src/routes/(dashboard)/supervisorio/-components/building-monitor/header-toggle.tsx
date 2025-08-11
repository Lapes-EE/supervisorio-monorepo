import { Link, useSearch } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function HeaderToggle() {
  const { type } = useSearch({ from: '/(dashboard)/supervisorio/' })

  return (
    <Card className="flex items-center justify-center">
      <ToggleGroup type="single" value={type}>
        <ToggleGroupItem
          aria-label="Toggle voltage"
          asChild
          className="px-10"
          value="voltage"
        >
          <Link search={{ type: 'voltage' }} to="/supervisorio">
            Tensão
          </Link>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Toggle current"
          asChild
          className="px-10"
          value="current"
        >
          <Link search={{ type: 'current' }} to="/supervisorio">
            Corrente
          </Link>
        </ToggleGroupItem>
        <ToggleGroupItem
          aria-label="Toggle power"
          asChild
          className="px-10"
          value="power"
        >
          <Link search={{ type: 'power' }} to="/supervisorio">
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
    </Card>
  )
}
