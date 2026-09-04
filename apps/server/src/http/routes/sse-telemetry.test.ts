import { db, schema, sql } from "@repo/db"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { api } from "@/app"
import { sseConnectionManager } from "../sse/connection-manager"
import {
  startTelemetryListener,
  stopTelemetryListener,
} from "../sse/telemetry-listener"
import { makeMeters } from "../tests/factories/make-meters"
import { makeTelemetry } from "../tests/factories/make-telemetry"

describe("SSE Telemetry Route Tests", () => {
  beforeEach(async () => {
    await api.ready()
    await db.delete(schema.measures).execute()
    sseConnectionManager.clear()
  })

  afterEach(async () => {
    await stopTelemetryListener()
    sseConnectionManager.clear()
  })

  test("GET /sse/telemetry registers client in sseConnectionManager", async () => {
    const addSpy = vi.spyOn(sseConnectionManager, "add")
    const controller = new AbortController()

    const injectPromise = api.inject({
      method: "GET",
      url: "/sse/telemetry",
      headers: {
        accept: "text/event-stream",
      },
      signal: controller.signal,
    })

    // Wait briefly for route handler to execute
    await new Promise((resolve) => setTimeout(resolve, 50))
    controller.abort()

    try {
      await injectPromise
    } catch {
      // Abort error is expected
    }

    expect(addSpy).toHaveBeenCalled()
    expect(sseConnectionManager.size).toBe(0) // Cleaned up on abort/close
    addSpy.mockRestore()
  })

  test("GET /sse/telemetry returns 503 if capacity limit is reached", async () => {
    const sizeSpy = vi
      .spyOn(sseConnectionManager, "size", "get")
      .mockReturnValue(100)

    const response = await api.inject({
      method: "GET",
      url: "/sse/telemetry",
    })

    expect(response.statusCode).toBe(503)
    expect(response.body).toContain("Server at capacity")

    sizeSpy.mockRestore()
  })

  test("telemetry-listener triggers broadcast on DB notify", async () => {
    const broadcastSpy = vi.spyOn(sseConnectionManager, "broadcast")
    const meter = await makeMeters()

    await makeTelemetry({
      meterId: meter.id,
      frequencia: 60,
      tensaoFaseNeutroA: 220,
    })

    await startTelemetryListener()

    await sql`SELECT pg_notify('telemetry_changes', ${JSON.stringify({ meterId: meter.id })})`

    // Wait briefly for LISTEN callback to fetch and broadcast
    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(broadcastSpy).toHaveBeenCalledWith(
      "telemetry-update",
      expect.objectContaining({
        total: 1,
        data: expect.arrayContaining([
          expect.objectContaining({
            meterId: meter.id,
            status: "success",
          }),
        ]),
      })
    )

    broadcastSpy.mockRestore()
  })
})
