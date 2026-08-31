import { db, schema, sql } from "@repo/db"
import { hash } from "argon2"
import { beforeEach } from "vitest"

beforeEach(async () => {
  await sql`TRUNCATE TABLE meters, measures, "user" RESTART IDENTITY CASCADE`

  const passwordHash = await hash("t2festado327")

  await db.insert(schema.user).values({
    password: passwordHash,
    username: "lapes",
  })
})
