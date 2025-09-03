import { Link, useNavigate } from '@tanstack/react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { GetMeters200Item } from '@/http/gen/model'

export function TelemetryList({
  id,
  ip,
  name,
  description,
  active,
}: GetMeters200Item) {
  const navigate = useNavigate()

  function handleClick(_: React.MouseEvent<HTMLDivElement>) {
    navigate({
      to: '/telemetria/$telemetryIp',
      params: { telemetryIp: ip },
    })
  }
  return (
    <Card
      className={`relative hover:scale-105 hover:cursor-pointer ${
        active ? '' : 'border border-red-500'
      }`}
    >
      <div className="absolute top-2 right-2 z-50 flex gap-2">
        <Link
          params={{ meterId: id.toString() }}
          to="/telemetria/$meterId/edit"
        >
          <Button
            className="hover:cursor-pointer"
            size="icon"
            variant="outline"
          >
            <Pencil />
          </Button>
        </Link>
        <Link
          params={{ meterId: id.toString() }}
          to="/telemetria/$meterId/delete"
        >
          <Button
            className="hover:cursor-pointer"
            size="icon"
            variant="outline"
          >
            <Trash2 />
          </Button>
        </Link>
      </div>
      <CardHeader onClick={handleClick}>
        <CardTitle>{name}</CardTitle>
        <CardDescription className="flex flex-col">
          <span>{description}</span>
          <span>{ip}</span>
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
