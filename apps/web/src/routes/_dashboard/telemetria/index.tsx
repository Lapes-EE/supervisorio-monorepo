import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TelemetryForm } from "@/components/telemetrys-form";
import { TelemetryList } from "@/components/telemetrys-list";
import { getMeters } from "@/http/generated";

export const Route = createFileRoute("/_dashboard/telemetria/")({
	component: Dashboard,
	beforeLoad: ({ context }) => {
		context.queryClient.ensureQueryData({
			queryKey: ["Meters"],
			queryFn: async () => {
				const result = await getMeters();
				return result.data;
			},
		});
	},
});

function Dashboard() {
	const { data } = useQuery({
		queryKey: ["Meters"],
		queryFn: async () => {
			const result = await getMeters();
			return result.data;
		},
	});
	return (
		<div className="grid grid-cols-3 gap-4">
			<TelemetryForm />
			{data?.map((list) => (
				<TelemetryList
					key={list.id}
					id={list.id}
					ip={list.ip}
					description={list.description}
					name={list.name}
				/>
			))}
		</div>
	);
}
