import { dbEnv } from '@repo/env/db'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  casing: 'snake_case',
  schema: '../../packages/db/src/schema/**.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: dbEnv.DATABASE_URL,
  },
})
