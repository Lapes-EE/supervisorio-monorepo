import { sql } from "@repo/db";
import { fetchLastMeasurement } from "../utils/telemetry-query-builder";
import { transformToNested } from "../routes/get-database-telemetry";
import { sseConnectionManager } from "./connection-manager";

let unlistenFn: (() => Promise<void>) | null = null;

export async function startTelemetryListener() {
	if (unlistenFn) return;

	const onnotify = async (payload: string) => {
		try {
			const { meterId } = JSON.parse(payload);
			if (!meterId) return;

			const result = await fetchLastMeasurement({ meterId });
			const flatData = result.data;
			const total = result.total;
			const nestedData = flatData.map(transformToNested);
			const nullCount = nestedData.filter(
				(row) => row.status === "error",
			).length;

			const ssePayload = {
				data: nestedData,
				total,
				period: {
					startDate:
						nestedData.length > 0 ? nestedData[0].time : new Date().toISOString(),
					endDate:
						nestedData.length > 0
							? (nestedData.at(-1)?.time ?? new Date().toISOString())
							: new Date().toISOString(),
				},
				nullCount,
				aggregation: "raw",
			};

			await sseConnectionManager.broadcast("telemetry-update", ssePayload);
		} catch (err) {
			console.error("[SSE Listener] Error handling notification:", err);
		}
	};

	const onlisten = async () => {
		try {
			// Initial sync on startup/reconnect to broadcast latest readings
			const result = await fetchLastMeasurement();
			const flatData = result.data;
			const total = result.total;
			const nestedData = flatData.map(transformToNested);
			const nullCount = nestedData.filter(
				(row) => row.status === "error",
			).length;

			const ssePayload = {
				data: nestedData,
				total,
				period: {
					startDate:
						nestedData.length > 0 ? nestedData[0].time : new Date().toISOString(),
					endDate:
						nestedData.length > 0
							? (nestedData.at(-1)?.time ?? new Date().toISOString())
							: new Date().toISOString(),
				},
				nullCount,
				aggregation: "raw",
			};

			await sseConnectionManager.broadcast("telemetry-update", ssePayload);
		} catch (err) {
			console.error(
				"[SSE Listener] Error during onlisten initial broadcast:",
				err,
			);
		}
	};

	const { unlisten } = await sql.listen(
		"telemetry_changes",
		onnotify,
		onlisten,
	);
	unlistenFn = unlisten;
}

export async function stopTelemetryListener() {
	if (unlistenFn) {
		await unlistenFn();
		unlistenFn = null;
	}
}
