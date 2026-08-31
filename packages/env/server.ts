import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: {
    API_URL: process.env.API_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    WEB_URL: process.env.WEB_URL,
  },
  server: {
    API_URL: z.string(),
    JWT_SECRET: z.uuid(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3333),
    WEB_URL: z.string(),
  },
})
