import { faker } from '@faker-js/faker'
import { db } from '@/db/connections.ts'
import { schema } from '@/db/schema'

export async function makeTelemetry({
  meterId,
  time,
  frequencia,
}: {
  meterId: number
  time?: string
  frequencia?: number
}) {
  const now = time || new Date().toISOString()
  const result = await db
    .insert(schema.measures)
    .values({
      meterId,
      time: now,
      frequencia: frequencia ?? faker.number.int({ min: 59, max: 61 }),
    })
    .returning()
  return result[0]
}
