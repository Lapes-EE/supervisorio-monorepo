import { describe, expect, test } from 'vitest'

describe('Test environment setup', () => {
  test('EventSource mock is defined globally', () => {
    expect(window.EventSource).toBeDefined()
    const es = new window.EventSource('/sse/telemetry')
    expect(es).toBeDefined()
    expect(es.url).toBe('/sse/telemetry')
  })
})
