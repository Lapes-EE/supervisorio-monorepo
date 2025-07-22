import { defineConfig } from "orval";

const backend_url = "http://localhost:3333"; // Change this to your backend URL

export default defineConfig({
	backend: {
		output: {
			mode: "split",
			target: "./src/http/generated.ts",
			schemas: "./src/http/model",
			client: "react-query",
			httpClient: "fetch",
			baseUrl: "http://localhost:3333",
			// mock: true,
			override: {
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
