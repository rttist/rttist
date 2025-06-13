import { rttistPlugin } from "vite-plugin-rttist"; // < 1. Import the plugin

import { join } from "node:path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import packageJson from "./package.json";

export default defineConfig({
	resolve: { preserveSymlinks: true }, // fix for local PNPM monorepo packages
	clearScreen: false,
	plugins: [
		// < 2. Initialize the plugin
		rttistPlugin({
			packageInfo: { name: packageJson.name, rootDir: __dirname },
			projectRoot: join(__dirname),
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
