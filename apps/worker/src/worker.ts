import { workerEnv } from "@repo/env/worker"
import { fastify } from "fastify"
import pino from "pino"
import { startTelemetryCollector } from "./services/telemetry-collector"

const logger = pino({ name: "worker" })
const app = fastify({ loggerInstance: logger })

app.get("/health", async () => ({ status: "ok" }))

app
  .listen({ host: "0.0.0.0", port: workerEnv.PORT })
  .then(() => {
    logger.info(`Worker listening on port ${workerEnv.PORT}`)
    startTelemetryCollector()
  })
  .catch((err) => {
    logger.error(err)
    process.exit(1)
  })
