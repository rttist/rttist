import { rttistPlugin } from "vite-plugin-rttist"; // < 1. Import the plugin

import { defineConfig, UserConfig } from "vite";
import { join } from "path";
import solid from "vite-plugin-solid";
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
		solid(),
	],
	build: {
		outDir: "dist/app",
	},
}) as UserConfig;
