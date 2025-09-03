import { eq } from 'drizzle-orm'
import cron from 'node-cron'
import PQueue from 'p-queue'
import pRetry from 'p-retry'
import { logger } from '@/app'
import { db } from '@/db/connections'
import { getAllMeters, insertMeasure } from '@/db/queries'
import { meters } from '@/db/schema/meters'
import { getTelemetryFromMeter } from './telemetry-service'

const queue = new PQueue({ concurrency: 14 })

// Set para controlar quais medidores estão em processamento
const processingMeters = new Set<string>()

export function startTelemetryCollector() {
  logger.info('[telemetry] Coletor agendado a cada 10s.')

  cron.schedule('*/10 * * * * *', async () => {
    logger.info('[telemetry] Iniciando ciclo de coleta...')

    try {
      const allMeters = await getAllMeters()
      logger.info(`[telemetry] ${allMeters.length} medidores encontrados.`)

      for (const meter of allMeters) {
        // Se o medidor já estiver em processamento, pula
        if (processingMeters.has(meter.ip)) {
          logger.info(
            { ip: meter.ip },
            '[telemetry] Medidor já em processamento, pulando.'
          )
          continue
        }

        // Marca o medidor como em processamento
        processingMeters.add(meter.ip)

        queue.add(async () => {
          try {
            await pRetry(() => handleMeter(meter.ip), {
              retries: 5,
              onFailedAttempt: (err) => {
                logger.warn(
                  {
                    ip: meter.ip,
                    attemptNumber: err.attemptNumber,
                    retriesLeft: err.retriesLeft,
                    cause: err,
                  },
                  `[telemetry] Tentativa falhou para ${meter.ip}`
                )
              },
            })
          } catch {
            // Após esgotar todas as tentativas
            await handleMeterFailure(meter.ip)
            await db
              .update(meters)
              .set({ active: false })
              .where(eq(meters.ip, meter.ip))
          } finally {
            // Remove do set quando a tarefa terminar
            processingMeters.delete(meter.ip)
          }
        })
      }
    } catch (err) {
      logger.error({ err }, '[telemetry] Falha ao buscar medidores')
    }
  })
}

async function handleMeter(ip: string) {
  logger.info({ ip }, '[telemetry] Coletando telemetria...')
  const data = await getTelemetryFromMeter(ip)
  await insertMeasure(data, ip)
  logger.info({ ip }, '[telemetry] Dados salvos com sucesso.')
}

async function handleMeterFailure(ip: string) {
  logger.error(
    { ip },
    '[telemetry] Todas as tentativas falharam. Inserindo registro com dados nulos.'
  )

  try {
    await insertMeasure({}, ip)
    logger.info(
      { ip },
      '[telemetry] Registro com dados nulos inserido com sucesso.'
    )
  } catch (insertError) {
    logger.error(
      { ip, insertError },
      '[telemetry] Falha ao inserir registro com dados nulos'
    )
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('[telemetry] Finalizando: aguardando fila esvaziar...')
  await queue.onIdle()
  logger.info('[telemetry] Fila vazia. Encerrando processo.')
  process.exit()
})
