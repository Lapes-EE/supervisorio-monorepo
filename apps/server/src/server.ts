import { env } from "@repo/env"
import { api } from "./app"
import {
  startTelemetryListener,
  stopTelemetryListener,
} from "./http/sse/telemetry-listener"

api
  .listen({ host: "0.0.0.0", port: env.PORT })
  .then(async () => {
    api.log.info("Server is running")
    await startTelemetryListener()
  })
  .catch((err) => {
    api.log.error(err)
    process.exit(1)
  })

// Graceful shutdown handlers
process.on("SIGTERM", async () => {
  api.log.info("SIGTERM received, shutting down gracefully")
  await stopTelemetryListener()
  await api.close()
  process.exit(0)
})

process.on("SIGINT", async () => {
  api.log.info("SIGINT received, shutting down gracefully")
  await stopTelemetryListener()
  await api.close()
  process.exit(0)
})
