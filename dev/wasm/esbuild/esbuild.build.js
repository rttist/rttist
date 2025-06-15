import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import { rttistPlugin } from "esbuild-plugin-rttist";
import packageJson from "./package.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const options = {
	entryPoints: ["src/index.ts"],
	outfile: "dist/out.js",
	platform: "node",
	format: "esm",
	target: "es2022",
	bundle: true,
	external: Object.keys(packageJson.dependencies).concat(Object.keys(packageJson.peerDependencies || {})),
	plugins: [
		rttistPlugin({
			packageInfo: { name: packageJson.name, rootDir: __dirname },
			projectRoot: __dirname,
		}),
	],
};

if (process.argv.includes("--watch")) {
	console.log("Starting watch mode...");
	const context = await esbuild.context(options);
	await context.watch();
} else {
	await esbuild.build(options);
}
