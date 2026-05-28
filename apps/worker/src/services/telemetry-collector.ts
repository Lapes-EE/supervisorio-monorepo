import { insertMeasure } from '@repo/db'
import { workerEnv } from '@repo/env/worker'
import { getTelemetryFromMeter } from '@repo/telemetry'
import cron from 'node-cron'
import PQueue from 'p-queue'
import pRetry, { AbortError } from 'p-retry'
import pino from 'pino'
import {
  checkMeterEnabled,
  getEligibleMeters,
  updateMeterFailure,
  updateMeterSuccess,
} from '../db/queries'
import { isMeterEligible } from './state-machine'

const logger = pino({ name: 'worker:collector' })
const queue = new PQueue({ concurrency: 14 })

async function collectFromMeter(ip: string, failureCount: number) {
  try {
    const telemetry = await pRetry(
      async () => {
        // Check if still enabled before attempt
        const isEnabled = await checkMeterEnabled(ip)
        if (!isEnabled) {
          throw new AbortError('Meter disabled during retry')
        }
        return await getTelemetryFromMeter(ip)
      },
      {
        retries: 5,
        onFailedAttempt: (error) => {
          logger.warn(
            `Attempt ${error.attemptNumber} failed for meter ${ip}. ${error.retriesLeft} retries left.`
          )
        },
      }
    )

    await insertMeasure(telemetry, ip)
    await updateMeterSuccess(ip)
    logger.info(`Successfully collected telemetry from meter ${ip}`)
  } catch (error: any) {
    if (error instanceof AbortError) {
      logger.info(`Collection aborted for meter ${ip}: ${error.message}`)
      return
    }

    const newFailureCount = failureCount + 1
    await updateMeterFailure(ip, newFailureCount)
    logger.error(
      `All retries failed for meter ${ip}. New failure count: ${newFailureCount}`
    )
  }
}

export function startTelemetryCollector() {
  const schedule = `*/${workerEnv.COLLECT_INTERVAL_SECONDS} * * * * *`

  cron.schedule(schedule, async () => {
    logger.debug('Running scheduled telemetry collection...')

    try {
      const allEnabledMeters = await getEligibleMeters()
      const now = new Date()

      const eligibleMeters = allEnabledMeters.filter((meter) =>
        isMeterEligible(meter as any, now, workerEnv.MAX_BACKOFF_SECONDS)
      )

      if (eligibleMeters.length === 0) {
        return
      }

      logger.info(`Queueing collection for ${eligibleMeters.length} meters`)

      for (const meter of eligibleMeters) {
        queue.add(() => collectFromMeter(meter.ip, meter.failureCount))
      }
    } catch (error) {
      logger.error(error, 'Error in telemetry collector loop')
    }
  })

  logger.info(
    `Telemetry collector started with interval ${workerEnv.COLLECT_INTERVAL_SECONDS}s`
  )
}

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down worker...')
  queue.pause()
  await queue.onIdle()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
