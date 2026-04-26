import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: [""],
		include: [
			"./src/tests/unit/**/*.test.ts",
			"./src/tests/integration/**/*.test.tsx",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json"],
			include: ["src/lib/**"],
			thresholds: {
				lines: 80,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
