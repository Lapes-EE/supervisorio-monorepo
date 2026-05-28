import { db, schema } from '@repo/db'
import { eq, sql } from 'drizzle-orm'

export function getEligibleMeters() {
  // Simple version: get all enabled meters, then filter in memory with state-machine logic
  // Alternatively, we could do complex SQL, but for now in-memory is fine given the small number of meters.
  return db.select().from(schema.meters).where(eq(schema.meters.enabled, true))
}

export function updateMeterSuccess(ip: string) {
  return db
    .update(schema.meters)
    .set({
      health: 'healthy',
      failureCount: 0,
      lastFailedAt: null,
    })
    .where(eq(schema.meters.ip, ip))
    .execute()
}

export function updateMeterFailure(ip: string, failureCount: number) {
  return db
    .update(schema.meters)
    .set({
      health: 'cooldown',
      failureCount,
      lastFailedAt: sql`now()`,
    })
    .where(eq(schema.meters.ip, ip))
    .execute()
}

export async function checkMeterEnabled(ip: string) {
  const [meter] = await db
    .select({ enabled: schema.meters.enabled })
    .from(schema.meters)
    .where(eq(schema.meters.ip, ip))
    .limit(1)
    .execute()

  return meter?.enabled ?? false
}
