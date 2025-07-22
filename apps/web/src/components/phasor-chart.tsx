import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Phasor {
	name: string;
	angle: number | undefined;
	magnitude: number;
	color: string;
	label: string | undefined;
}

interface PhasorChartProps {
	phasors: Phasor[];
}

export default function PhasorChart({ phasors }: PhasorChartProps) {
	// Função para converter coordenadas polares para cartesianas
	const polarToCartesian = (
		angle: number | undefined,
		radius: number,
		centerX: number,
		centerY: number,
	) => {
		const angleInRadians = ((angle ?? 0) * Math.PI) / 180.0;
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians),
		};
	};

	const svgSize = 300;
	const center = svgSize / 2;
	const maxRadius = 120;

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Diagrama Polar de Fasores Complexos</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col items-center">
				<div className="relative">
					<svg className="rounded-lg border" height={svgSize} width={svgSize}>
						<title>Diagrama Polar de Fasores Complexos</title>

						{/* Definir marcadores de seta */}
						<defs>
							{phasors.map((phasor) => (
								<marker
									id={`arrowhead-${phasor.name}`}
									key={phasor.name}
									markerHeight="8"
									markerUnits="strokeWidth"
									markerWidth="12"
									orient="auto"
									refX="10"
									refY="4"
								>
									<polygon
										fill={phasor.color}
										points="0,0 0,8 12,4"
										stroke={phasor.color}
									/>
								</marker>
							))}
						</defs>

						{/* Círculos concêntricos para referência */}
						{[0.25, 0.5, 0.75, 1].map((ratio, index) => (
							<circle
								cx={center}
								cy={center}
								fill="none"
								key={index}
								r={maxRadius * ratio}
								stroke="#e2e8f0"
								strokeDasharray={ratio === 1 ? "none" : "2,2"}
								strokeWidth="1"
							/>
						))}

						{/* Linhas radiais para referência angular */}
						{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
							(angle) => {
								const endPoint = polarToCartesian(
									angle,
									maxRadius,
									center,
									center,
								);
								return (
									<line
										key={angle}
										stroke="#f1f5f9"
										strokeWidth="0.5"
										x1={center}
										x2={endPoint.x}
										y1={center}
										y2={endPoint.y}
									/>
								);
							},
						)}

						{/* Eixos principais */}
						<line
							stroke="#94a3b8"
							strokeWidth="1"
							x1={center - maxRadius}
							x2={center + maxRadius}
							y1={center}
							y2={center}
						/>
						<line
							stroke="#94a3b8"
							strokeWidth="1"
							x1={center}
							x2={center}
							y1={center - maxRadius}
							y2={center + maxRadius}
						/>

						{/* Labels dos ângulos principais */}
						<text
							fill="#64748b"
							fontSize="12"
							textAnchor="start"
							x={center + maxRadius + 10}
							y={center + 5}
						>
							0°
						</text>
						<text
							fill="#64748b"
							fontSize="12"
							textAnchor="middle"
							x={center - 5}
							y={center - maxRadius - 5}
						>
							90°
						</text>
						<text
							fill="#64748b"
							fontSize="12"
							textAnchor="end"
							x={center - maxRadius - 10}
							y={center + 5}
						>
							180°
						</text>
						<text
							fill="#64748b"
							fontSize="12"
							textAnchor="middle"
							x={center - 5}
							y={center + maxRadius + 15}
						>
							270°
						</text>

						{/* Fasores */}
						{phasors.map((phasor, index) => {
							const endPoint = polarToCartesian(
								phasor.angle,
								maxRadius * phasor.magnitude,
								center,
								center,
							);
							const labelPoint = polarToCartesian(
								phasor.angle,
								maxRadius * phasor.magnitude + 20,
								center,
								center,
							);

							return (
								<g key={index}>
									{/* Linha do fasor */}
									<line
										markerEnd={`url(#arrowhead-${index})`}
										stroke={phasor.color}
										strokeWidth="3"
										x1={center}
										x2={endPoint.x}
										y1={center}
										y2={endPoint.y}
									/>

									{/* Label do fasor */}
									<text
										dominantBaseline="middle"
										fill={phasor.color}
										fontSize="14"
										fontWeight="bold"
										textAnchor="middle"
										x={labelPoint.x}
										y={labelPoint.y}
									>
										{phasor.label}
									</text>
								</g>
							);
						})}

						{/* Ponto central */}
						<circle cx={center} cy={center} fill="#1f2937" r="3" />
					</svg>
				</div>

				{/* Legenda */}
				<div className="mt-6 flex flex-wrap justify-center gap-6">
					{phasors.map((phasor, index) => (
						<div className="flex items-center gap-2" key={index}>
							<div
								className="h-4 w-4 rounded-full"
								style={{ backgroundColor: phasor.color }}
							/>
							<span className="font-medium text-sm">
								{phasor.name} ({phasor.label})
							</span>
						</div>
					))}
				</div>

				{/* Informações técnicas */}
				<div className="mt-4 text-center text-muted-foreground text-sm">
					<p>Sistema trifásico equilibrado • Módulo: 1 • Defasagem: 120°</p>
				</div>
			</CardContent>
		</Card>
	);
}
