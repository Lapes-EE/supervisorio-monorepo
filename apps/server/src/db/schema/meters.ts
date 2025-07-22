import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const meters = pgTable('meters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ip: text('ip').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
