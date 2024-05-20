import { rttistPlugin } from "vite-plugin-rttist"; // < 1. Import the plugin

import { join } from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import packageJson from "./package.json";

export default defineConfig({
	resolve: { preserveSymlinks: true }, // fix for local PNPM monorepo packages
	plugins: [
		// < 2. Initialize the plugin
		rttistPlugin({
			packageInfo: { name: packageJson.name, rootDir: __dirname },
			tsRootDir: join(__dirname, "src"),
			metadataOutDir: join(__dirname, "dist"),
		}),
		solidPlugin(),
	],
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
		outDir: "dist/app",
	},
});
