import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const healthEnum = pgEnum('health', ['healthy', 'failing', 'cooldown'])

export const meters = pgTable('meters', {
  id: serial('id').primaryKey(),
  issoSerial: text('isso_serial').notNull().unique(),
  name: text('name').notNull(),
  ip: text('ip').notNull().unique(),
  description: text('description'),
  active: boolean().default(true).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  health: healthEnum().default('healthy'),
  failureCount: integer('failure_count').default(0).notNull(),
  lastFailedAt: timestamp('last_failed_at', {
    withTimezone: true,
    mode: 'string',
  }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
})
