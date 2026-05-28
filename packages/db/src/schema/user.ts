import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: uuid().defaultRandom().primaryKey(),
  username: text().notNull(),
  password: text().notNull(),
})
