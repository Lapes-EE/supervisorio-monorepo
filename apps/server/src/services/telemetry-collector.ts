import cron from 'node-cron'
import PQueue from 'p-queue'
import pRetry from 'p-retry'
import { getAllMeters, insertMeasure } from '@/db/queries'
import { logger } from '@/server'
import { getTelemetryFromMeter } from './telemetry-service'

const queue = new PQueue({ concurrency: 14 })

export function startTelemetryCollector() {
  logger.info('[telemetry] Coletor agendado a cada 10s.')

  cron.schedule('*/10 * * * * *', async () => {
    logger.info('[telemetry] Iniciando ciclo de coleta...')

    try {
      const meters = await getAllMeters()
      logger.info(`[telemetry] ${meters.length} medidores encontrados.`)

      for (const meter of meters) {
        queue.add(() =>
          pRetry(() => handleMeter(meter.ip), {
            retries: 3,
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
          }).catch(async (finalError) => {
            // Após esgotar todos os retries, insere registro com dados nulos
            await handleMeterFailure(meter.ip, finalError)
          })
        )
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

async function handleMeterFailure(ip: string, error: Error) {
  logger.error(
    { ip, error },
    '[telemetry] Todas as tentativas falharam. Inserindo registro com dados nulos.'
  )

  try {
    // Insere apenas com os campos obrigatórios, os outros ficam null por padrão
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
