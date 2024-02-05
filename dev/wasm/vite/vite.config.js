import { defineConfig } from "vite";
import { rttistPlugin } from "vite-plugin-rttist";
import { join } from "path";
import solid from "vite-plugin-solid";

const packageJson = require("./package.json");

export default defineConfig({
	plugins: [
		rttistPlugin({
			packageInfo: { name: packageJson.name, rootDir: __dirname },
			tsRootDir: join(__dirname, "src"),
		}),
		solid(),
	],
});
