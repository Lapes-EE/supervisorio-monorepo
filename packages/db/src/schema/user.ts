import { pgTable, text, uuid } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: uuid().defaultRandom().primaryKey(),
  password: text().notNull(),
  username: text().notNull(),
})
