import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const workerEnv = createEnv({
  server: {
    PORT: z.coerce.number().default(3334),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    COLLECT_INTERVAL_SECONDS: z.coerce.number().default(10),
    MAX_BACKOFF_SECONDS: z.coerce.number().default(3600),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    COLLECT_INTERVAL_SECONDS: process.env.COLLECT_INTERVAL_SECONDS,
    MAX_BACKOFF_SECONDS: process.env.MAX_BACKOFF_SECONDS,
  },
  emptyStringAsUndefined: true,
})
