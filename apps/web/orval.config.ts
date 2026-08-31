import { defineConfig } from "orval"

const backend_url = "http://localhost:3333" // Change this to your backend URL

export default defineConfig({
  backend: {
    input: {
      target: `${backend_url}/openapi.json`,
    },
    output: {
      client: "react-query",
      httpClient: "axios",
      mode: "single",
      namingConvention: "kebab-case",
      // baseUrl intentionally omitted — generated endpoints use relative paths
      // and rely on the axios instance baseURL from custom-instance.ts
      override: {
        mutator: {
          name: "customInstance",
          path: "./src/http/custom-instance.ts",
        },
        query: {
          useQuery: true,
          // useSuspenseQuery: true,
          // useSuspenseInfiniteQuery: true,
          // useInfinite: true,
          // useInfiniteQueryParam: 'limit',
        },
      },
      schemas: "./src/http/gen/model",
      target: "./src/http/gen/endpoints",
    },
    // hooks: {
    // 	afterAllFilesWrite: "prettier --write",
    // },
  },
})
