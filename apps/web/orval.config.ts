import { defineConfig } from "orval";

const backend_url = "http://localhost:3333"; // Change this to your backend URL

export default defineConfig({
	backend: {
		output: {
			mode: "split",
			namingConvention: "kebab-case",
			target: "./src/http/gen/endpoints",
			schemas: "./src/http/gen/model",
			client: "react-query",
			httpClient: "fetch",
			fileExtension: '.gen.ts',
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
