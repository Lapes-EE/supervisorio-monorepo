import { faker } from "@faker-js/faker"
import type { measures } from "@repo/db"
import { db, schema } from "@repo/db"
import type { InferInsertModel } from "drizzle-orm"

export async function makeTelemetry(
  overrides: Partial<InferInsertModel<typeof measures>> & {
    meterId: number
  }
) {
  const result = await db
    .insert(schema.measures)
    .values({
      frequencia: faker.number.int({ max: 61, min: 59 }),
      time: new Date().toISOString(),
      ...overrides,
    })
    .returning()
  return result[0]
}
