import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface KpiCardProps {
  description?: string
  icon: LucideIcon
  isLoading?: boolean
  title: string
  unit: string
  value: string | number
}

export function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  isLoading,
}: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-2xl">{value}</span>
            <span className="text-muted-foreground text-sm">{unit}</span>
          </div>
        )}
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
