import { Link, useNavigate } from '@tanstack/react-router'
import { Activity, Pencil, Settings, Trash2, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { GetMeters200Item } from '@/http/gen/model/get-meters200-item.gen'

export function TelemetryList({
  id,
  ip,
  name,
  description,
  active,
  issoSerial,
}: GetMeters200Item) {
  const navigate = useNavigate()

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (target.closest('button, a')) {
      return
    }
    navigate({
      to: '/telemetria/$telemetryIp',
      params: { telemetryIp: ip },
    })
  }

  return (
    <Card
      className={`group hover:-translate-y-1 relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl ${
        active
          ? 'border-l-3 border-l-green-500/30 hover:border-l-green-600'
          : 'border-l-3 border-l-red-500/30 opacity-75 hover:border-l-red-600'
      }`}
    >
      <CardHeader onClick={handleClick}>
        <CardTitle className="flex items-center gap-3 truncate text-xl transition-colors group-hover:text-primary">
          <div
            className={`rounded-lg p-2 ${
              active
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Activity className="h-5 w-5" />
          </div>
          {name}
        </CardTitle>
        <CardDescription className="ml-14 line-clamp-2 text-sm">
          {description}
        </CardDescription>
        <CardAction>
          <div className="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Link params={{ meterId: id.toString() }} to="/settings/$meterId">
              <Button
                className="h-8 w-8 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                size="icon"
                variant="secondary"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              params={{ meterId: id.toString() }}
              to="/telemetria/$meterId/edit"
            >
              <Button
                className="h-8 w-8 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                size="icon"
                variant="secondary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              params={{ meterId: id.toString() }}
              to="/telemetria/$meterId/delete"
            >
              <Button
                className="h-8 w-8 shadow-lg transition-all hover:scale-110 hover:bg-red-100 hover:text-red-600 hover:shadow-xl"
                size="icon"
                variant="secondary"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="pb-4" onClick={handleClick}>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 font-medium text-xs backdrop-blur-sm ${
              active
                ? 'border border-green-500/30 bg-green-500/20 text-green-700'
                : 'border border-red-500/30 bg-red-500/20 text-red-700'
            }`}
          >
            {active ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </>
            )}
          </div>
          <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
            {ip}
          </code>
          <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
            {issoSerial}
          </code>
        </div>
      </CardContent>
    </Card>
  )
}
