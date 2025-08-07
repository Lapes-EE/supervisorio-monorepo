import NumberFlow from '@number-flow/react'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

type ItemProps = {
  label: string
  value: number | undefined
  isLoading?: boolean
  suffix?: string
  className?: string
  style?: React.CSSProperties
}

export default function TelemetryItem({
  label,
  value,
  isLoading,
  suffix,
  style,
  className,
}: ItemProps) {
  return (
    <div className="flex flex-col items-center justify-between">
      <Label>{label}</Label>
      {isLoading ? (
        <Skeleton className="h-5 w-10" />
      ) : (
        <NumberFlow
          className={className}
          format={{ minimumFractionDigits: 2 }}
          style={style}
          suffix={suffix ? ` ${suffix}` : ''}
          value={value ?? 0}
        />
      )}
      <Separator className="my-4" />
    </div>
  )
}
