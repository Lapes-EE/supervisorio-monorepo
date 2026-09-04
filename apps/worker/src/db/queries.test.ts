import { db, schema } from "@repo/db"
import { eq } from "drizzle-orm"
import { beforeEach, describe, expect, test } from "vitest"
import {
  checkMeterEnabled,
  getEligibleMeters,
  updateMeterFailure,
  updateMeterSuccess,
} from "./queries"

beforeEach(async () => {
  await db.delete(schema.meters).execute()
})

describe("Worker DB Queries Integration", () => {
  test("getEligibleMeters returns enabled meters", async () => {
    await db
      .insert(schema.meters)
      .values([
        {
          enabled: true,
          health: "healthy",
          ip: "1.1.1.1",
          issoSerial: "ABC-111-ABC-111",
          name: "Enabled",
        },
        {
          enabled: false,
          health: "healthy",
          ip: "2.2.2.2",
          issoSerial: "ABC-222-ABC-222",
          name: "Disabled",
        },
      ])
      .execute()

    const eligible = await getEligibleMeters()
    expect(eligible).toHaveLength(1)
    expect(eligible[0].ip).toBe("1.1.1.1")
  })

  test("updateMeterSuccess resets health state", async () => {
    await db
      .insert(schema.meters)
      .values({
        enabled: true,
        failureCount: 5,
        health: "cooldown",
        ip: "1.1.1.1",
        issoSerial: "ABC-111-ABC-111",
        lastFailedAt: new Date().toISOString(),
        name: "Test",
      })
      .execute()

    await updateMeterSuccess("1.1.1.1")

    const [meter] = await db
      .select()
      .from(schema.meters)
      .where(eq(schema.meters.ip, "1.1.1.1"))
    expect(meter.health).toBe("healthy")
    expect(meter.failureCount).toBe(0)
    expect(meter.lastFailedAt).toBeNull()
  })

  test("updateMeterFailure updates health state", async () => {
    await db
      .insert(schema.meters)
      .values({
        enabled: true,
        failureCount: 0,
        health: "healthy",
        ip: "1.1.1.1",
        issoSerial: "ABC-111-ABC-111",
        name: "Test",
      })
      .execute()

    await updateMeterFailure("1.1.1.1", 1)

    const [meter] = await db
      .select()
      .from(schema.meters)
      .where(eq(schema.meters.ip, "1.1.1.1"))
    expect(meter.health).toBe("cooldown")
    expect(meter.failureCount).toBe(1)
    expect(meter.lastFailedAt).not.toBeNull()
  })

  test("checkMeterEnabled returns correct status", async () => {
    await db
      .insert(schema.meters)
      .values({
        enabled: false,
        ip: "1.1.1.1",
        issoSerial: "ABC-111-ABC-111",
        name: "Test",
      })
      .execute()

    const isEnabled = await checkMeterEnabled("1.1.1.1")
    expect(isEnabled).toBe(false)
  })
})
