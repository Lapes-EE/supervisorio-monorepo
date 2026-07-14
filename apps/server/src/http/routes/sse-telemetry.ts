import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { sseConnectionManager } from "../sse/connection-manager";

export const sseTelemetry: FastifyPluginCallbackZod = (app) => {
	app.get(
		"/sse/telemetry",
		{
			schema: {
				hide: true,
			},
			sse: true,
		} as any,
		async (request, reply) => {
			if (sseConnectionManager.size >= sseConnectionManager.MAX_CONNECTIONS) {
				reply.status(503).send("Server at capacity");
				return;
			}

			const added = sseConnectionManager.add(reply);
			if (!added) {
				reply.status(503).send("Server at capacity");
				return;
			}

			reply.header("X-Accel-Buffering", "no");

			reply.sse.keepAlive();

			// Send initial message to initialize the SSE stream and prevent immediate closure
			await reply.sse.send({
				event: "connected",
				data: { status: "ready" },
			});

			reply.sse.onClose(() => {
				sseConnectionManager.remove(reply);
			});
		},
	);
};
