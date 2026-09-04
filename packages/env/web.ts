import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const webEnv = createEnv({
  client: {
    VITE_API_URL: z.string().url(),
    VITE_ESTIMATION_API_URL: z.string().url().default("http://localhost:8000"),
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: import.meta.env,
})
