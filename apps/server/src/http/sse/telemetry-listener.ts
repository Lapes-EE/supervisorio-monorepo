import { sql } from '@repo/db'
import { api } from '@/app'
import { transformToNested } from '../routes/get-database-telemetry'
import { fetchLastMeasurement } from '../utils/telemetry-query-builder'
import { sseConnectionManager } from './connection-manager'

let unlistenFn: (() => Promise<void>) | null = null

async function broadcastLatestTelemetry(meterId?: number) {
  const result = await fetchLastMeasurement(meterId ? { meterId } : {})
  const flatData = result.data
  const total = result.total
  const nestedData = flatData.map(transformToNested)
  const nullCount = nestedData.filter((row) => row.status === 'error').length

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
    aggregation: 'raw',
  }

  await sseConnectionManager.broadcast('telemetry-update', ssePayload)
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
      api.log.error({ err }, '[SSE Listener] Error handling notification')
    }
  }

  const onlisten = async () => {
    try {
      await broadcastLatestTelemetry()
    } catch (err) {
      api.log.error(
        { err },
        '[SSE Listener] Error during onlisten initial broadcast'
      )
    }
  }

  const { unlisten } = await sql.listen('telemetry_changes', onnotify, onlisten)
  unlistenFn = unlisten
}

export async function stopTelemetryListener() {
  if (unlistenFn) {
    await unlistenFn()
    unlistenFn = null
  }
}
