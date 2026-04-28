import { defineConfig } from "orval";

const backend_url = process.env.API_URL ?? "http://localhost:3333";

export default defineConfig({
	backend: {
		output: {
			mode: "single",
			namingConvention: "kebab-case",
			target: "./src/http/gen/endpoints",
			schemas: "./src/http/gen/model",
			client: "react-query",
			httpClient: "axios",
			fileExtension: '.gen.ts',
			override: {
				mutator: {
					path: './src/http/custom-instance.ts',
					name: 'customInstance',
				},
				query: {
					useQuery: true,
				},
				aliasCombinedTypes: true,
			},
		},
		input: {
			target: `${backend_url}/openapi.json`,
		},
	},
});
