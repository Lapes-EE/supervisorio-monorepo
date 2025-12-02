import { faker } from '@faker-js/faker'
import { db } from '@/db/connections.ts'
import { schema } from '@/db/schema'

function generateIssoSerial() {
  const part1 = faker.string.numeric(3) // 258
  const part2 = faker.string.alphanumeric({ length: 3 }).toUpperCase() // A17
  const part3 = faker.string
    .hexadecimal({ length: 3 })
    .replace('0x', '')
    .toUpperCase() // 39C
  const part4 = faker.string
    .hexadecimal({ length: 3 })
    .replace('0x', '')
    .toUpperCase() // D6A

  return `${part1}-${part2}-${part3}-${part4}`
}

export async function makeMeters() {
  const result = await db
    .insert(schema.meters)
    .values({
      name: faker.lorem.words(2),
      ip: faker.internet.ipv4(),
      issoSerial: generateIssoSerial(),
      description: faker.lorem.sentence(),
    })
    .returning()

  return result[0]
}
