import { getTelemetryFromMeter, indices } from '@repo/telemetry'
import { afterEach, describe, expect, test, vi } from 'vitest'

const IP = '192.168.1.99'
const TIMEOUT_ERROR = /Erro ao coletar telemetria do medidor/

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getTelemetryFromMeter', () => {
  test('returns formatted telemetry on success', async () => {
    const maxIndex = Math.max(...Object.values(indices))
    const dados = Array.from({ length: maxIndex + 1 }, (_, i) => i)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ sucesso: true, dados: [[], dados] }),
      })
    )

    const result = await getTelemetryFromMeter(IP)

    expect(Object.keys(result).sort()).toEqual(Object.keys(indices).sort())
    expect(result.tensao_fase_neutro_a).toBe(
      dados[indices.tensao_fase_neutro_a]
    )
  })

  test('rejects with generic error when fetch times out', async () => {
    // Mock fetch that never resolves on its own but rejects when the abort
    // signal fires — mirroring real fetch's abort behavior.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(init.signal?.reason)
            )
          })
      )
    )

    await expect(getTelemetryFromMeter(IP, 50)).rejects.toThrow(TIMEOUT_ERROR)
  })
})
