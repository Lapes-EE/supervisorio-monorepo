import NumberFlow from '@number-flow/react'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

type ItemProps = {
  label: string
  value: number | undefined
  isLoading?: boolean
  suffix?: string
}

export default function TelemetryItem({
  label,
  value,
  isLoading,
  suffix,
}: ItemProps) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      {isLoading ? (
        <Skeleton className="h-5 w-10" />
      ) : (
        <NumberFlow
          format={{ minimumFractionDigits: 2 }}
          suffix={suffix ? ` ${suffix}` : ''}
          value={value ?? 0}
        />
      )}
    </div>
  )
}
