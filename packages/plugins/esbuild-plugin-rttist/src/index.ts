import * as fs from "node:fs";
import * as esbuild from "esbuild";
import { PackageInfo, transform } from "@rttist/ts-loader-wasm";

const ESBUILD_COMMON_OPTIONS = new Set([
	"sourcemap",
	"legalComments",
	"sourceRoot",
	"sourcesContent",
	"format",
	"globalName",
	"target",
	"supported",
	"platform",
	"mangleProps",
	"reserveProps",
	"mangleQuoted",
	"mangleCache",
	"drop",
	"dropLabels",
	"minify",
	"minifyWhitespace",
	"minifyIdentifiers",
	"minifySyntax",
	"lineLimit",
	"charset",
	"treeShaking",
	"ignoreAnnotations",
	"jsx",
	"jsxFactory",
	"jsxFragment",
	"jsxImportSource",
	"jsxDev",
	"jsxSideEffects",
	"define",
	"pure",
	"keepNames",
	"color",
	"logLevel",
	"logLimit",
	"logOverride",
	"tsconfigRaw",
]);

export type RttistPluginOptions = {
	packageInfo: {
		name: string;
		rootDir: string;
	};
	tsRootDir: string;
};

export function rttistPlugin(pluginOptions: RttistPluginOptions) {
	if (!pluginOptions.tsRootDir || pluginOptions.tsRootDir.length === 0) {
		throw new Error("tsRootDir is required");
	}

	if (
		!pluginOptions.packageInfo ||
		!pluginOptions.packageInfo.rootDir ||
		pluginOptions.packageInfo.rootDir.length === 0
	) {
		throw new Error("packageInfo.rootDir is required");
	}

	if (!pluginOptions.packageInfo.name || pluginOptions.packageInfo.name.length === 0) {
		throw new Error("packageInfo.name is required");
	}

	return {
		name: "esbuild-plugin-rttist",
		setup(build) {
			build.onResolve({ filter: /\/internal.typelib$/ }, (args) => {
				return {
					external: true,
				} satisfies esbuild.OnResolveResult;
			});

			build.onLoad({ filter: /\.(tsx?|mts|cts)$/ }, async (args) => {
				const input = await fs.promises.readFile(args.path, "utf8");
				const transformed = transform(
					input,
					args.path,
					new PackageInfo(pluginOptions.packageInfo.name, pluginOptions.tsRootDir) // TODO: Change PackageInfo to some object; we abuse PAckageInfo.rootDir to pass tsRootDir
				);
				console.log("onload:", build.initialOptions.tsconfig, build.initialOptions.tsconfigRaw);
				const options: esbuild.TransformOptions = {
					sourcefile: args.path,
					loader: "ts",
					tsconfigRaw: build.initialOptions.tsconfigRaw,
				};

				for (let prop of Object.keys(build.initialOptions)) {
					if (ESBUILD_COMMON_OPTIONS.has(prop)) {
						(options as any)[prop] = (build.initialOptions as any)[prop];
					}
				}

				const contents = (await esbuild.transform(transformed, options)).code;

				return {
					contents: contents,
				} satisfies esbuild.OnLoadResult;
			});
		},
	} as esbuild.Plugin;
}
