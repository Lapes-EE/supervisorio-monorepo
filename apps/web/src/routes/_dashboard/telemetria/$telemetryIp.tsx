import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import PhasorChart, { type Phasor } from "@/components/phasor-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getMetersGetTelemetryIp } from "@/http/generated";

export const Route = createFileRoute("/_dashboard/telemetria/$telemetryIp")({
	component: Dashboard,
	beforeLoad: ({ context, params }) => {
		context.queryClient.prefetchQuery({
			queryKey: ["Telemetry", params.telemetryIp],
			queryFn: async () => {
				const result = await getMetersGetTelemetryIp(params.telemetryIp);
				return result.data;
			},
		});
	},
});

type ItemProps = {
	label: string;
	value: number | undefined;
	isLoading?: boolean;
	suffix?: string;
};

function Item({ label, value, isLoading, suffix }: ItemProps) {
	return (
		<div className="flex items-center justify-between">
			<Label>{label}</Label>
			{isLoading ? (
				<Skeleton className="h-5 w-10" />
			) : (
				<NumberFlow
					format={{ minimumFractionDigits: 2 }}
					suffix={suffix ? ` ${suffix}` : ""}
					value={value ?? 0}
				/>
			)}
		</div>
	);
}

function Dashboard() {
	const { telemetryIp } = Route.useParams();
	const {
		data: rawData,
		isLoading: rawDataIsLoading,
		isError,
	} = useQuery({
		queryKey: ["Telemetry", telemetryIp],
		queryFn: async () => {
			const result = await getMetersGetTelemetryIp(telemetryIp);
			return result.data;
		},
		refetchInterval: 1000 * 2, // 2 Segundos
	});

	const phasors: Phasor[] = [
		{
			name: "Fase A",
			angle: rawData?.angulo_fase_a,
			magnitude: 1,
			color: "var(--chart-1)",
			label: `${rawData?.angulo_fase_a.toFixed(0)}°`,
		},
		{
			name: "Fase B",
			angle: rawData?.angulo_fase_b, // Random de 0 a 5 graus
			magnitude: 1,
			color: "var(--chart-2)",
			label: `${rawData?.angulo_fase_b.toFixed(0)}°`,
		},
		{
			name: "Fase C",
			angle: rawData?.angulo_fase_c, // Random de 0 a 5 graus
			magnitude: 1,
			color: "var(--chart-3)",
			label: `${rawData?.angulo_fase_c.toFixed(0)}°`,
		},
	];

	return (
		<>
			{isError ? (
				<Alert variant="destructive">
					<AlertCircleIcon />
					<AlertTitle>Não foi possível acessar o medidor</AlertTitle>
					<AlertDescription>
						<p>Please verify your billing information and try again.</p>
						<ul className="list-inside list-disc text-sm">
							<li>Check your card details</li>
							<li>Ensure sufficient funds</li>
							<li>Verify billing address</li>
						</ul>
					</AlertDescription>
				</Alert>
			) : (
				<div className="space-y-4 rounded-md border p-4">
					{/* Parte superior */}
					<div className="grid grid-cols-3 gap-4">
						{/* Coluna 1 - Fasores */}
						<div className="col-span-2 row-span-2">
							<PhasorChart phasors={phasors} />
						</div>

						{/* Coluna 2 - Frequência */}
						<Card className="col-span-1">
							<CardHeader>
								<CardTitle>Frequência</CardTitle>
							</CardHeader>
							<CardContent>
								{rawData ? (
									<NumberFlow
										className="font-bold text-2xl"
										format={{ minimumFractionDigits: 2 }}
										suffix="Hz"
										value={rawData?.frequencia}
									/>
								) : (
									<Skeleton className="h-5 w-10" />
								)}
							</CardContent>
						</Card>

						{/* Coluna 2 - Ângulos */}
						<Card className="col-span-1">
							<CardHeader>
								<CardTitle>Ângulo de fase</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-row justify-between space-y-2">
								<div>
									<Item
										isLoading={rawDataIsLoading}
										label="A"
										suffix="°"
										value={rawData?.angulo_fase_a}
									/>
									<Item
										isLoading={rawDataIsLoading}
										label="B"
										suffix="°"
										value={rawData?.angulo_fase_b}
									/>
									<Item
										isLoading={rawDataIsLoading}
										label="C"
										suffix="°"
										value={rawData?.angulo_fase_c}
									/>
								</div>
								<div>
									<Item
										isLoading={rawDataIsLoading}
										label="A"
										value={rawData?.phi_fase_a}
									/>
									<Item
										isLoading={rawDataIsLoading}
										label="B"
										value={rawData?.phi_fase_b}
									/>
									<Item
										isLoading={rawDataIsLoading}
										label="C"
										value={rawData?.phi_fase_c}
									/>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Grid inferior */}
					<div className="grid grid-cols-3 gap-4">
						<Card>
							<CardHeader>
								<CardTitle>Tensão fase-neutro</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Item
									isLoading={rawDataIsLoading}
									label="A"
									suffix="V"
									value={rawData?.tensao_fase_neutro_a}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="B"
									suffix="V"
									value={rawData?.tensao_fase_neutro_b}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="C"
									suffix="V"
									value={rawData?.tensao_fase_neutro_c}
								/>
							</CardContent>
						</Card>
						{/* 1 */}
						<Card>
							<CardHeader>
								<CardTitle>Tensão fase-fase</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Item
									isLoading={rawDataIsLoading}
									label="AB"
									suffix="V"
									value={rawData?.tensao_fase_fase_ab}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="BC"
									suffix="V"
									value={rawData?.tensao_fase_fase_bc}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="CA"
									suffix="V"
									value={rawData?.tensao_fase_fase_ca}
								/>
							</CardContent>
						</Card>

						{/* 2 */}
						<Card>
							<CardHeader>
								<CardTitle>Corrente</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Item
									isLoading={rawDataIsLoading}
									label="A"
									suffix="A"
									value={rawData?.corrente_a}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="B"
									suffix="A"
									value={rawData?.corrente_b}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="C"
									suffix=" A"
									value={rawData?.corrente_c}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="N (calculado)"
									suffix=" A"
									value={rawData?.corrente_de_neutro_calculado}
								/>
							</CardContent>
						</Card>

						{/* 3 */}
						<Card>
							<CardHeader>
								<CardTitle>Potência ativa total</CardTitle>
								<CardDescription>Fundamental + Harmônica</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								<Item
									isLoading={rawDataIsLoading}
									label="A"
									suffix="kW"
									value={
										((rawData?.potencia_ativa_fundamental_harmonica_a ?? 0) +
											(rawData?.potencia_ativa_harmonica_a ?? 0)) /
										1000
									}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="B"
									suffix="kW"
									value={
										(rawData?.potencia_ativa_fundamental_harmonica_b ?? 0) /
										1000
									}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="C"
									suffix="kW"
									value={
										(rawData?.potencia_ativa_fundamental_harmonica_c ?? 0) /
										1000
									}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="Soma"
									value={
										rawData?.potencia_ativa_fundamental_harmonica_total ?? 0
									}
								/>
							</CardContent>
						</Card>

						{/* 4 */}
						<Card>
							<CardHeader>
								<CardTitle>Potência ativa fundamental</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Item
									isLoading={rawDataIsLoading}
									label="A"
									suffix="kW"
									value={
										((rawData?.potencia_ativa_fundamental_a ?? 0) +
											(rawData?.potencia_ativa_harmonica_a ?? 0)) /
										1000
									}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="B"
									suffix="kW"
									value={(rawData?.potencia_ativa_fundamental_b ?? 0) / 1000}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="C"
									suffix="kW"
									value={(rawData?.potencia_ativa_fundamental_c ?? 0) / 1000}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="Soma"
									suffix="kW"
									value={
										(rawData?.potencia_ativa_fundamental_total ?? 0) / 1000
									}
								/>
							</CardContent>
						</Card>

						{/* 5 */}
						<Card>
							<CardHeader>
								<CardTitle>Potência ativa harmônica</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Item
									isLoading={rawDataIsLoading}
									label="A"
									suffix="W"
									value={rawData?.potencia_ativa_harmonica_a}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="B"
									suffix="W"
									value={rawData?.potencia_ativa_harmonica_b}
								/>
								<Item
									isLoading={rawDataIsLoading}
									label="C"
									suffix="W"
									value={rawData?.potencia_ativa_harmonica_c}
								/>
							</CardContent>
						</Card>
					</div>
				</div>
			)}
		</>
	);
}
