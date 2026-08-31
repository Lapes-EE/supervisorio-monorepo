import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const workerEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: {
    COLLECT_INTERVAL_SECONDS: process.env.COLLECT_INTERVAL_SECONDS,
    MAX_BACKOFF_SECONDS: process.env.MAX_BACKOFF_SECONDS,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  },
  server: {
    COLLECT_INTERVAL_SECONDS: z.coerce.number().default(10),
    MAX_BACKOFF_SECONDS: z.coerce.number().default(3600),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3334),
  },
})
