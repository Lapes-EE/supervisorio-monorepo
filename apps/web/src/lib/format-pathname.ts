import { isIP } from "is-ip"
import type { GetMeters200Item } from "@/http/gen/model/get-meters200-item"

const shouldBeANumber = /^\d+$/

export function formatPathname(pathname: string, meters: GetMeters200Item[]) {
  const segments = pathname.split("/").filter(Boolean)
  const lastSegment = segments.at(-1) ?? "Dashboard"

  if (isIP(lastSegment)) {
    const meter = meters.find((m) => m.ip === lastSegment)
    return meter ? meter.description : lastSegment
  }

  if (shouldBeANumber.test(lastSegment)) {
    const meter = meters.find((m) => m.id === Number(lastSegment))
    return meter ? meter.description : lastSegment
  }

  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
}
