import request from 'supertest'
import { expect, test } from 'vitest'
import { api } from '@/app'

test('Telemetry by IP route', async () => {
  api.ready()

  const response = await request(api.server).get('/telemetry/172.21.65.19')

  expect(response.status).toBe(200)
  expect(response.body).toEqual(
    expect.objectContaining({
      frequencia: expect.any(Number),
    })
  )
})
