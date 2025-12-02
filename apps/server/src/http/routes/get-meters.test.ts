import request from 'supertest'
import { expect, test } from 'vitest'
import { api } from '@/app'
import { makeMeters } from '../tests/factories/make-meters'

test('Get meters', async () => {
  api.ready()

  await makeMeters()

  const response = await request(api.server).get('/meters')

  expect(response.status).toBe(200)
  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        ip: expect.any(String),
        description: expect.any(String),
      }),
    ])
  )
})
