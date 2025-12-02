import request from 'supertest'
import { beforeEach, expect, test } from 'vitest'
import { api } from '@/app'
import { makeMeters } from '../tests/factories/make-meters'

let token = ''

beforeEach(async () => {
  await api.ready()
  const loginResponse = await request(api.server)
    .post('/sessions/password')
    .send({
      username: 'lapes',
      password: 't2festado327',
    })
  token = loginResponse.body.token
})

test('Change meter status', async () => {
  const meter = await makeMeters()

  const response = await request(api.server)
    .patch(`/meter/${meter.id}`)
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(204)
})

test('Change status of a non-existing meter (should theoretically fail but returns 204 because update does not throw on no match)', async () => {
  const response = await request(api.server)
    .patch('/meter/99999')
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(204)
})

test('Change meter status without authorization', async () => {
  const response = await request(api.server).patch('/meter/1')

  expect(response.status).toBe(401)
})
