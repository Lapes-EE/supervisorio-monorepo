import pino from 'pino'
import type { Formatted } from './formatted-schema'
import { indices } from './indices'

const logger = pino({ name: 'telemetry' })

interface ResponseData {
  sucesso: boolean
  dados: number[][]
}

export async function getTelemetryFromMeter(ip: string): Promise<Formatted> {
  try {
    const url = new URL(`http://${ip}/sys.cgi`)
    url.searchParams.set('readshared', '_MedicaoEnergia')
    url.searchParams.set('type', 'V')

    const response = await fetch(url.toString())
    const data = (await response.json()) as ResponseData

    if (!data?.dados?.[1]) {
      throw new Error('Resposta inválida da API externa')
    }

    const formatted = Object.fromEntries(
      Object.entries(indices).map(([key, idx]) => [key, data.dados[1][idx]])
    ) as Formatted

    logger.debug('[telemetry-service] Telemetria coletada com sucesso.')

    return formatted
  } catch (err) {
    logger.error({ ip, err }, '[telemetry-service] Erro ao coletar telemetria')
    throw new Error(`Erro ao coletar telemetria do medidor ${ip}`)
  }
}
