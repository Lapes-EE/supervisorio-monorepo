import { faker } from '@faker-js/faker'
import { db } from '@/db/connections.ts'
import { schema } from '@/db/schema'

export async function makeMeters() {
  const result = await db
    .insert(schema.meters)
    .values({
      name: faker.lorem.words(2),
      ip: faker.internet.ipv4(),
      description: faker.lorem.sentence(),
    })
    .returning()

  return result[0]
}
