import { faker } from '@faker-js/faker'
import type { measures } from '@repo/db'
import { db, schema } from '@repo/db'
import type { InferInsertModel } from 'drizzle-orm'

export async function makeTelemetry(
  overrides: Partial<InferInsertModel<typeof measures>> & {
    meterId: number
  }
) {
  const result = await db
    .insert(schema.measures)
    .values({
      time: new Date().toISOString(),
      frequencia: faker.number.int({ min: 59, max: 61 }),
      ...overrides,
    })
    .returning()
  return result[0]
}
