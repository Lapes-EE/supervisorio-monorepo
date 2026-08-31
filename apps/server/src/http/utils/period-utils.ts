import type { PeriodType } from "./telemetry-schema"

export interface PeriodDates {
  endDate: Date
  startDate: Date
}

export function getPeriodDates(period: PeriodType): PeriodDates {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  )

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  switch (period) {
    case "last_measurement":
      return {
        endDate: now,
        startDate: new Date(0),
      }
    case "last_5_minutes":
      return {
        endDate: now,
        startDate: new Date(now.getTime() - 5 * 60 * 1000),
      }
    case "last_30_minutes":
      return {
        endDate: now,
        startDate: new Date(now.getTime() - 30 * 60 * 1000),
      }
    case "last_hour":
      return {
        endDate: now,
        startDate: new Date(now.getTime() - 60 * 60 * 1000),
      }
    case "last_6_hours":
      return {
        endDate: now,
        startDate: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      }
    case "last_12_hours":
      return {
        endDate: now,
        startDate: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      }
    case "last_24_hours":
      return {
        endDate: now,
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      }
    case "today":
      return {
        endDate: endOfDay,
        startDate: startOfDay,
      }
    case "last_7_days":
      return {
        endDate: now,
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      }
    case "this_month":
      return {
        endDate: now,
        startDate: startOfMonth,
      }
    case "last_30_days":
      return {
        endDate: now,
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      }
    case "this_year":
      return {
        endDate: now,
        startDate: startOfYear,
      }
    default:
      throw new Error("Invalid period")
  }
}
