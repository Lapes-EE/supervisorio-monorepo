import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const meters = pgTable('meters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ip: text('ip').notNull().unique(),
  description: text('description'),
  active: boolean().default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
