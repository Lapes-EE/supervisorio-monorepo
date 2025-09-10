import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3333),
    API_URL: z.string(),
    NODE_ENV: z.enum(['development', 'on', 'test']).default('development'),
    HYPER_DATABASE_URL: z.string(),
    HYPER_POSTGRES_USER: z.string(),
    HYPER_POSTGRES_PASSWORD: z.string(),
    HYPER_POSTGRES_DB: z.string(),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    API_URL: process.env.API_URL,
    HYPER_DATABASE_URL: process.env.HYPER_DATABASE_URL,
    HYPER_POSTGRES_USER: process.env.HYPER_POSTGRES_USER,
    HYPER_POSTGRES_PASSWORD: process.env.HYPER_POSTGRES_PASSWORD,
    HYPER_POSTGRES_DB: process.env.HYPER_POSTGRES_DB,
  },
  emptyStringAsUndefined: true,
})
