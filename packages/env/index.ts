import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3333),
    API_URL: z.string(),
    NODE_ENV: z.enum(['development', 'on', 'test']).default('development'),
    HYPER_DATABASE_URL: z.string(),
    JWT_SECRET: z.uuid(),
    PASSWORD: z.string(),
    WEB_URL: z.string(),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    WEB_URL: process.env.WEB_URL,
    HYPER_DATABASE_URL: process.env.HYPER_DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    PASSWORD: process.env.PASSWORD,
  },
  emptyStringAsUndefined: true,
})
