import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const webEnv = createEnv({
  client: {
    VITE_API_URL: z.string().url(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
