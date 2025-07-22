import { useNavigate } from "@tanstack/react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { GetMeters200Item } from "@/http/model";

export function TelemetryList({ id, ip, name, description }: GetMeters200Item) {
	const navigate = useNavigate();

	function handleClick(_: React.MouseEvent<HTMLDivElement>) {
		navigate({
			to: "/telemetria/$telemetryIp",
			params: { telemetryIp: ip },
		});
	}
	return (
		<Card
			className="hover:scale-105 hover:cursor-pointer"
			onClick={handleClick}
		>
			<CardHeader>
				<CardTitle>{name}</CardTitle>
				<CardDescription className="flex flex-col">
					<span>{description}</span>
					<span>{ip}</span>
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
