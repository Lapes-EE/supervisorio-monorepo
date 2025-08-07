import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { getMetersGetTelemetryIp } from '@/http/gen/endpoints/lapes-scada-api.gen'

type TelemetryData = Awaited<ReturnType<typeof getMetersGetTelemetryIp>>['data']

export interface Phasor {
  name: string
  angle: number | undefined
  magnitude: number
  color: string
  label: string | undefined
}

interface PhasorChartProps {
  phasors: Phasor[]
  telemetryData: TelemetryData | undefined
}

export default function PhasorChart({
  phasors,
  telemetryData,
}: PhasorChartProps) {
  const polarToCartesian = (
    angle: number | undefined,
    radius: number,
    centerX: number,
    centerY: number
  ) => {
    const angleInRadians = ((angle ?? 0) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY - radius * Math.sin(angleInRadians),
    }
  }

  const svgSize = 180
  const center = svgSize / 2
  const maxRadius = 90

  const phaseData = [
    {
      name: 'Fase A',
      color: 'var(--chart-1)',
      angle: telemetryData?.angulo_fase_a,
      phi: telemetryData?.phi_fase_a,
    },
    {
      name: 'Fase B',
      color: 'var(--chart-2)',
      angle: telemetryData?.angulo_fase_b,
      phi: telemetryData?.phi_fase_b,
    },
    {
      name: 'Fase C',
      color: 'var(--chart-3)',
      angle: telemetryData?.angulo_fase_c,
      phi: telemetryData?.phi_fase_c,
    },
  ]

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader>
        <CardTitle>Diagrama Fasorial</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 items-center gap-4">
        <div className="relative">
          <svg className="rounded-lg" height={svgSize} width={svgSize}>
            <title>Diagrama Fasorial</title>
            {[0.5, 1].map((ratio) => (
              <circle
                cx={center}
                cy={center}
                fill="none"
                key={ratio}
                r={maxRadius * ratio}
                stroke="#e2e8f0"
                strokeDasharray={ratio === 1 ? 'none' : '2,2'}
                strokeWidth="1"
              />
            ))}
            <line
              stroke="#1f2937"
              strokeWidth="0.5"
              x1={0}
              x2={svgSize}
              y1={center}
              y2={center}
            />
            <line
              stroke="#1f2937"
              strokeWidth="0.5"
              x1={center}
              x2={center}
              y1={0}
              y2={svgSize}
            />
            <text
              fill="#1f2937"
              fontSize="10"
              textAnchor="end"
              x={svgSize - 10}
              y={center - 5}
            >
              0°
            </text>
            {phasors.map((phasor) => {
              const endPoint = polarToCartesian(
                phasor.angle,
                maxRadius * phasor.magnitude,
                center,
                center
              )
              return (
                <g key={phasor.name}>
                  <line
                    markerEnd={`url(#arrowhead-${phasor.name})`}
                    stroke={phasor.color}
                    strokeWidth="5"
                    x1={center}
                    x2={endPoint.x}
                    y1={center}
                    y2={endPoint.y}
                  />
                </g>
              )
            })}
            <circle cx={center} cy={center} fill="#1f2937" r="3" />
          </svg>
        </div>

        {/* Valores (ângulo e phi) */}
        <div className="flex flex-col gap-2">
          {phaseData.map((phase) => (
            <div
              className="flex w-40 justify-end gap-4 font-mono text-sm"
              key={phase.name}
            >
              <span>{phase.angle?.toFixed(1) ?? '0.0'}°</span>
              <span className="text-gray-500">
                φ {phase.phi?.toFixed(1) ?? '0.0'}°
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="col-span-2 mt-2 flex justify-evenly text-sm">
        {phaseData.map((phase) => (
          <div className="flex items-center gap-2" key={phase.name}>
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: phase.color }}
            />
            <span>{phase.name}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  )
}
