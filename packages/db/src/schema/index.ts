// biome-ignore lint/performance/noBarrelFile: Schema export barrel
export { measures } from "./measures"
export { healthEnum, meters } from "./meters"
export { user } from "./user"

import { measures } from "./measures"
import { meters } from "./meters"
import { user } from "./user"

export const schema = {
  measures,
  meters,
  user,
}
