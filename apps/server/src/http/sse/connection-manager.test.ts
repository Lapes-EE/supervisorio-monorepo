import { describe, expect, test, vi } from "vitest";
import type { FastifyReply } from "fastify";
import { SSEConnectionManager } from "./connection-manager";

describe("SSEConnectionManager", () => {
	test("should register a connection successfully", () => {
		const manager = new SSEConnectionManager();
		const mockReply = {
			sse: {
				send: vi.fn(),
			},
		} as unknown as FastifyReply;

		const result = manager.add(mockReply);
		expect(result).toBe(true);
		expect(manager.size).toBe(1);
	});

	test("should enforce MAX_CONNECTIONS capacity limit", () => {
		const manager = new SSEConnectionManager();
		for (let i = 0; i < 100; i++) {
			const mockReply = {
				sse: { send: vi.fn() },
			} as unknown as FastifyReply;
			expect(manager.add(mockReply)).toBe(true);
		}

		const extraReply = {
			sse: { send: vi.fn() },
		} as unknown as FastifyReply;
		expect(manager.add(extraReply)).toBe(false);
		expect(manager.size).toBe(100);
	});

	test("should remove a connection successfully", () => {
		const manager = new SSEConnectionManager();
		const mockReply = {
			sse: { send: vi.fn() },
		} as unknown as FastifyReply;

		manager.add(mockReply);
		manager.remove(mockReply);
		expect(manager.size).toBe(0);
	});

	test("should broadcast telemetry updates to all active clients", async () => {
		const manager = new SSEConnectionManager();
		const send1 = vi.fn().mockResolvedValue(undefined);
		const send2 = vi.fn().mockResolvedValue(undefined);

		const reply1 = { sse: { send: send1 } } as unknown as FastifyReply;
		const reply2 = { sse: { send: send2 } } as unknown as FastifyReply;

		manager.add(reply1);
		manager.add(reply2);

		await manager.broadcast("telemetry-update", { meterId: 1 });

		expect(send1).toHaveBeenCalledWith(
			expect.objectContaining({
				event: "telemetry-update",
				data: { meterId: 1 },
			}),
		);
		expect(send2).toHaveBeenCalledWith(
			expect.objectContaining({
				event: "telemetry-update",
				data: { meterId: 1 },
			}),
		);
	});

	test("should remove dead clients if broadcasting to them fails", async () => {
		const manager = new SSEConnectionManager();
		const send1 = vi.fn().mockRejectedValue(new Error("Connection lost"));
		const send2 = vi.fn().mockResolvedValue(undefined);

		const reply1 = { sse: { send: send1 } } as unknown as FastifyReply;
		const reply2 = { sse: { send: send2 } } as unknown as FastifyReply;

		manager.add(reply1);
		manager.add(reply2);

		await manager.broadcast("telemetry-update", { meterId: 1 });

		expect(send1).toHaveBeenCalled();
		expect(send2).toHaveBeenCalled();
		expect(manager.size).toBe(1); // reply1 is dead and should be removed
	});
});
