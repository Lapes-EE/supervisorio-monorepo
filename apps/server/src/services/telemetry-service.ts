import { api } from '@/app'
import { indices } from '@/http/types/format-telemetry-response'
import type { Formatted } from '@/http/types/get-telemetry-response'

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

    api.log.debug('[telemetry-service] Telemetria coletada com sucesso.')

    return formatted
  } catch (err) {
    api.log.error({ ip, err }, '[telemetry-service] Erro ao coletar telemetria')
    throw new Error(`Erro ao coletar telemetria do medidor ${ip}`)
  }
}
