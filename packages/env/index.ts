import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    DATABASE_URL: z.url(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    HYPER_DATABASE_URL: z.string(),
    HYPER_POSTGRES_USER: z.string(),
    HYPER_POSTGRES_PASSWORD: z.string(),
    HYPER_POSTGRES_DB: z.string(),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
    HYPER_DATABASE_URL: process.env.HYPER_DATABASE_URL,
    HYPER_POSTGRES_USER: process.env.HYPER_POSTGRES_USER,
    HYPER_POSTGRES_PASSWORD: process.env.HYPER_POSTGRES_PASSWORD,
    HYPER_POSTGRES_DB: process.env.HYPER_POSTGRES_DB,
  },
  emptyStringAsUndefined: true,
})
