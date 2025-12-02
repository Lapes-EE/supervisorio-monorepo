import type { PeriodType } from './telemetry-schema'

export interface PeriodDates {
  startDate: Date
  endDate: Date
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
    case 'last_5_minutes':
      return {
        startDate: new Date(now.getTime() - 5 * 60 * 1000),
        endDate: now,
      }
    case 'last_30_minutes':
      return {
        startDate: new Date(now.getTime() - 30 * 60 * 1000),
        endDate: now,
      }
    case 'last_hour':
      return {
        startDate: new Date(now.getTime() - 60 * 60 * 1000),
        endDate: now,
      }
    case 'last_6_hours':
      return {
        startDate: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'last_12_hours':
      return {
        startDate: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'last_24_hours':
      return {
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'today':
      return {
        startDate: startOfDay,
        endDate: endOfDay,
      }
    case 'last_7_days':
      return {
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'this_month':
      return {
        startDate: startOfMonth,
        endDate: now,
      }
    case 'last_30_days':
      return {
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: now,
      }
    case 'this_year':
      return {
        startDate: startOfYear,
        endDate: now,
      }
    default:
      throw new Error('Invalid period')
  }
}
