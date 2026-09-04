import request from "supertest"
import { beforeEach, expect, test } from "vitest"
import { api } from "@/app"
import { makeMeters } from "../tests/factories/make-meters"

let token = ""

beforeEach(async () => {
  await api.ready()
  const loginResponse = await request(api.server)
    .post("/sessions/password")
    .send({
      username: "lapes",
      password: "t2festado327",
    })
  ;({ token } = loginResponse.body)
})

test("Delete a meter", async () => {
  const meter = await makeMeters()

  const response = await request(api.server)
    .delete(`/meters/${meter.id}`)
    .set("Authorization", `Bearer ${token}`)

  expect(response.status).toBe(204)
})

test("Delete a non-existing meter", async () => {
  const response = await request(api.server)
    .delete("/meters/99999")
    .set("Authorization", `Bearer ${token}`)

  expect(response.status).toBe(404)
  expect(response.body).toEqual({ error: "Medidor não encontrado  " })
})

test("Delete a meter without authorization", async () => {
  const response = await request(api.server).delete("/meters/1")

  expect(response.status).toBe(401)
  expect(response.body).toEqual({ error: "Token inválido ou ausente" })
})
