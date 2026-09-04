import { resolve } from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: resolve(import.meta.dirname, "./src") }],
  },
  test: {
    coverage: {
      enabled: true,
      exclude: ["**/*.text.ts", "src/tests/**"],
      include: ["src/http/routes/*.ts"],
      provider: "v8",
      reporter: ["text-summary", "text", "json", "html"],
    },
    fileParallelism: false,
    setupFiles: ["./src/http/tests/setup.ts"],
  },
})
