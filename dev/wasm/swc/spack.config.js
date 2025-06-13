const { config } = require("@swc/core/spack");
const { join } = require("path");

module.exports = config({
	entry: join(__dirname, "src/index.ts"),
	output: {
		path: join(__dirname, "dist"),
	},
	target: "node",
	module: {},
	options: {
		jsc: {
			baseUrl: __dirname,
			target: "es2022",
			parser: {
				syntax: "typescript",
				tsx: true,
				decorators: true,
				decoratorsBeforeExport: false,
				dynamicImport: true,
				privateMethod: false,
			},
			experimental: {
				plugins: [
					[
						"swc-plugin-rttist",
						{
							// Usually "name" property from the package.json of your package
							name: "@demo",
							rootDir: "src",
						},
					],
				],
			},
		},
		sourceMaps: false,
		minify: false,
	},
});
