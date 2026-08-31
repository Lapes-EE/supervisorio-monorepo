import { resolve } from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: resolve(import.meta.dirname, "./src") }],
  },
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text-summary", "text", "json", "html"],
    },
    fileParallelism: false,
  },
})
