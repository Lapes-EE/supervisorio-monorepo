import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const healthEnum = pgEnum("health", ["healthy", "failing", "cooldown"])

export const meters = pgTable("meters", {
  active: boolean().default(true).notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  description: text("description"),
  enabled: boolean("enabled").default(true).notNull(),
  failureCount: integer("failure_count").default(0).notNull(),
  health: healthEnum().default("healthy"),
  id: serial("id").primaryKey(),
  ip: text("ip").notNull().unique(),
  issoSerial: text("isso_serial").notNull().unique(),
  lastFailedAt: timestamp("last_failed_at", {
    mode: "string",
    withTimezone: true,
  }),
  name: text("name").notNull(),
})
