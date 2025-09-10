import { eq } from 'drizzle-orm'
import cron from 'node-cron'
import { logger } from '@/app'
import { db } from '@/db/connections'
import { schema } from '@/db/schema'

const RETRY_DISABLED_METERS_MINUTES = 5 // tempo em minutos para tentar reativar

export function startDisabledMetersRetry() {
  logger.info(
    `[telemetry] Reativador agendado a cada ${RETRY_DISABLED_METERS_MINUTES} minutos.`
  )

  cron.schedule(`*/${RETRY_DISABLED_METERS_MINUTES} * * * *`, async () => {
    logger.info('[telemetry] Verificando medidores desativados...')

    try {
      const disabledMeters = await db
        .select()
        .from(schema.meters)
        .where(eq(schema.meters.active, false))

      if (disabledMeters.length === 0) {
        logger.info('[telemetry] Nenhum medidor desativado encontrado.')
        return
      }

      logger.info(
        `[telemetry] Reativando ${disabledMeters.length} medidores...`
      )

      const meters = await db
        .update(schema.meters)
        .set({ active: true })
        .where(eq(schema.meters.active, false))
        .returning()

      meters.map((meter) => {
        return logger.info(
          `[telemetry] Medidor ${meter.ip} reativados com sucesso.`
        )
      })
    } catch (err) {
      logger.error({ err }, '[telemetry] Falha ao reativar medidores.')
    }
  })
}
