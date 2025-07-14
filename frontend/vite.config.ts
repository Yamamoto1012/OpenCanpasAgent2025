import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
	],
	server: {
		proxy: {
			// CORS対策
			"/api": {
				target: "http://localhost:8000",
				changeOrigin: true,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: "./vitest.setup.ts",
	},
});
