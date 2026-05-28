import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/worker.ts'],
  noExternal: [/@repo\//],
})
