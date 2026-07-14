import type { FastifyReply } from "fastify";

export class SSEConnectionManager {
	private clients = new Set<FastifyReply>();
	readonly MAX_CONNECTIONS = 100;

	add(reply: FastifyReply): boolean {
		if (this.clients.size >= this.MAX_CONNECTIONS) {
			return false;
		}
		this.clients.add(reply);
		return true;
	}

	remove(reply: FastifyReply): void {
		this.clients.delete(reply);
	}

	async broadcast(event: string, data: unknown): Promise<void> {
		const deadClients: FastifyReply[] = [];
		const promises = Array.from(this.clients).map(async (reply) => {
			try {
				if (reply.sse && typeof reply.sse.send === "function") {
					await reply.sse.send({
						id: Date.now().toString(),
						event,
						data,
					});
				} else {
					deadClients.push(reply);
				}
			} catch (error) {
				deadClients.push(reply);
			}
		});

		await Promise.all(promises);

		for (const dead of deadClients) {
			this.remove(dead);
		}
	}

	get size(): number {
		return this.clients.size;
	}
}

export const sseConnectionManager = new SSEConnectionManager();
