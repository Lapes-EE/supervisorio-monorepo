import { dbEnv } from '@repo/env/db'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from './schema/index.ts'

export const sql = postgres(dbEnv.DATABASE_URL)
export const db = drizzle(sql, {
  schema,
  casing: 'snake_case',
})
