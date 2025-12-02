import { hash } from 'argon2'
import { beforeEach } from 'vitest'
import { db, sql } from '@/db/connections'
import { schema } from '@/db/schema'

beforeEach(async () => {
  await sql`TRUNCATE TABLE meters, measures, "user" RESTART IDENTITY CASCADE`

  const passwordHash = await hash('t2festado327')

  await db.insert(schema.user).values({
    username: 'lapes',
    password: passwordHash,
  })
})
