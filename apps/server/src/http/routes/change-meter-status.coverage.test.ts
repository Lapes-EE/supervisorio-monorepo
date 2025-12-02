import request from 'supertest'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { api } from '@/app'
import { db } from '@/db/connections'

let token = ''

beforeEach(async () => {
  await api.ready()
  // Login to get token
  const loginResponse = await request(api.server)
    .post('/sessions/password')
    .send({
      username: 'lapes',
      password: 't2festado327',
    })
  token = loginResponse.body.token
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('Change meter status handles DB error', async () => {
  // Spy on db.update and make it throw
  // Drizzle's db.update is a function.
  vi.spyOn(db, 'update').mockImplementationOnce(() => {
    throw new Error('Database connection failed')
  })

  const response = await request(api.server)
    .patch('/meter/1') // ID doesn't matter if we force error
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(400)
})
