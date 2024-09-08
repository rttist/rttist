const path = require("node:path");
const esbuild = require("esbuild");
const { rttistPlugin } = require("esbuild-plugin-rttist");

const packageJson = require("./package.json");

esbuild
	.build({
		entryPoints: ["src/index.ts"],
		outfile: "dist/out.js",
		platform: "node",
		format: "cjs",
		target: "es2022",
		bundle: true,
		external: Object.keys(packageJson.dependencies).concat(Object.keys(packageJson.peerDependencies || {})),
		plugins: [
			rttistPlugin({
				packageInfo: { name: packageJson.name, rootDir: __dirname },
				tsRootDir: path.join(__dirname, "src"),
			}),
		],
	})
	.catch((err) => {
		console.error(err);
	});
