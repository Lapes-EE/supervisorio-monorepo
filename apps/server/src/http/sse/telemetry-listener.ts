import { sql } from "@repo/db"
import { api } from "@/app"
import { transformToNested } from "../routes/get-database-telemetry"
import { fetchLastMeasurement } from "../utils/telemetry-query-builder"
import { sseConnectionManager } from "./connection-manager"

let unlistenFn: (() => Promise<void>) | null = null

async function broadcastLatestTelemetry(meterId?: number) {
  const result = await fetchLastMeasurement(meterId ? { meterId } : {})
  const { data: flatData, total } = result
  const nestedData = flatData.map(transformToNested)
  const nullCount = nestedData.filter((row) => row.status === "error").length

  const ssePayload = {
    aggregation: "raw",
    data: nestedData,
    nullCount,
    period: {
      endDate:
        nestedData.length > 0
          ? (nestedData.at(-1)?.time ?? new Date().toISOString())
          : new Date().toISOString(),
      startDate:
        nestedData.length > 0 ? nestedData[0].time : new Date().toISOString(),
    },
    total,
  }

  await sseConnectionManager.broadcast("telemetry-update", ssePayload)
}

export async function startTelemetryListener() {
  if (unlistenFn) {
    return
  }

  const onnotify = async (payload: string) => {
    try {
      const { meterId } = JSON.parse(payload)
      if (!meterId) {
        return
      }

      await broadcastLatestTelemetry(meterId)
    } catch (err) {
      api.log.error({ err }, "[SSE Listener] Error handling notification")
    }
  }

  const onlisten = async () => {
    try {
      await broadcastLatestTelemetry()
    } catch (err) {
      api.log.error(
        { err },
        "[SSE Listener] Error during onlisten initial broadcast"
      )
    }
  }

  const { unlisten } = await sql.listen("telemetry_changes", onnotify, onlisten)
  unlistenFn = unlisten
}

export async function stopTelemetryListener() {
  if (unlistenFn) {
    await unlistenFn()
    unlistenFn = null
  }
}
