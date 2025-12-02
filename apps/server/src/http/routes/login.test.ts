import request from 'supertest'
import { beforeAll, expect, test } from 'vitest'
import { api } from '@/app'

beforeAll(async () => {
  await api.ready()
})

test('should be able to login with valid credentials', async () => {
  const response = await request(api.server).post('/sessions/password').send({
    username: 'lapes',
    password: 't2festado327',
  })

  expect(response.status).toBe(201)
  expect(response.body).toEqual({
    token: expect.any(String),
  })
})

test('should not be able to login with invalid credentials', async () => {
  const response = await request(api.server).post('/sessions/password').send({
    username: 'lapes',
    password: 'wrongpassword',
  })

  expect(response.status).toBe(400)
  expect(response.text).toBe('Credenciais inválidas')
})

test('should not be able to login with non-existing user', async () => {
  const response = await request(api.server).post('/sessions/password').send({
    username: 'non-existing-user',
    password: 'any-password',
  })

  expect(response.status).toBe(400)
  expect(response.text).toBe('Credenciais inválidas')
})
