import { defineConfig } from "orval";

const backend_url = "http://localhost:3333"; // Change this to your backend URL

export default defineConfig({
	backend: {
		output: {
			mode: "single",
			namingConvention: "kebab-case",
			target: "./src/http/gen/endpoints",
			schemas: "./src/http/gen/model",
			client: "react-query",
			httpClient: "axios",
			// baseUrl intentionally omitted — generated endpoints use relative paths
			// and rely on the axios instance baseURL from custom-instance.ts
			override: {
                mutator: {
                    path: './src/http/custom-instance.ts',
                    name: 'customInstance',
                },
				query: {
					useQuery: true,
					// useSuspenseQuery: true,
					// useSuspenseInfiniteQuery: true,
					// useInfinite: true,
					// useInfiniteQueryParam: 'limit',
				},
			},
		},
		input: {
			target: `${backend_url}/openapi.json`,
		},
		// hooks: {
		// 	afterAllFilesWrite: "prettier --write",
		// },
	},
});
