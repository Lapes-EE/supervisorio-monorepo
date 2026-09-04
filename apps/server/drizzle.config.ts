import { dbEnv } from "@repo/env/db"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: dbEnv.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "./src/db/migrations",
  schema: "../../packages/db/src/schema/**.ts",
})
