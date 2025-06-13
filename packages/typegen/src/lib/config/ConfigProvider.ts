import { ConfigurationBuilder, type IRootConfiguration } from "@netleaf/extensions-configuration";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { CommandLineArguments } from "../../declarations/command-line-arguments";
import type { DependencyInfo } from "../../declarations/dependency-info";
import type { PackageInfo } from "../../declarations/package-info";
import type { PackageJson } from "../../declarations/package-json";
import { TargetPlatform } from "../../declarations/target-platform";
import { Logger, LogLevel } from "../logging";
import { joinPaths, normalizePath, resolvePath } from "../utils/path";
import type { Config } from "./config";
import { getPackageInfo } from "./get-package-info";
import { getTsConfig } from "./get-ts-config";
import { lazyTypescript } from "../utils/lazy-typescript";
import { removeExtension } from "../transformer/utils/remove-extension";
import type { ConfigReflectionSection } from "./config-reflection-section";
import type * as ts from "typescript";

const enum TsModuleResolutionKind {
	Classic = 1,
	NodeJs = 2,
	Node10 = 2,
	Node16 = 3,
	NodeNext = 99,
	Bundler = 100,
}
type Match<K extends keyof T, T> = {
	[P in K]: T[P];
};
type EnumCheck = Match<
	keyof typeof ts.ModuleResolutionKind,
	{
		Classic: 1;
		NodeJs: 2;
		Node10: 2;
		Node16: 3;
		NodeNext: 99;
		Bundler: 100;
	}
>;

// Declaration that just checks that our copied ModuleResolutionKind match the TS one.
// We copied that, because it's the only runtime reference to TS; we don't want to load TS early because it's big
// and takes time to load; block build when there is nothing to rebuild.
const _enumCheck: typeof ts.ModuleResolutionKind = {
	Classic: TsModuleResolutionKind.Classic as number,
	NodeJs: TsModuleResolutionKind.NodeJs as number,
	Node10: TsModuleResolutionKind.Node10 as number,
	Node16: TsModuleResolutionKind.Node16 as number,
	NodeNext: TsModuleResolutionKind.NodeNext as number,
	Bundler: TsModuleResolutionKind.Bundler as number,
	[TsModuleResolutionKind.Classic]: "Classic",
	[TsModuleResolutionKind.Node10]: "Node10",
	[TsModuleResolutionKind.Node16]: "Node16",
	[TsModuleResolutionKind.NodeNext]: "NodeNext",
	[TsModuleResolutionKind.Bundler]: "Bundler",
};

const DefaultConfiguration: ConfigReflectionSection = {
	preset: null,
	devMode: false,
	logLevel: "Info",
	dependencyResolution: "typelibs",
	target: TargetPlatform[TargetPlatform.Universal] as keyof typeof TargetPlatform,
	plugins: [],
	metadata: {
		encode: true,
		outDir: "dist/",
		include: ["**/*"],
		exclude: ["**/@types/node/**"],
		includeDtsFiles: false,
		// emit: "js"
		typelibImportPath: "./internal.typelib",
		target: "es2020",
		excludePackages: [],
	},
};

const Presets: Record<Exclude<ConfigReflectionSection["preset"], null>, ConfigReflectionSection> = {
	vite: {
		...DefaultConfiguration,
		metadata: {
			...DefaultConfiguration.metadata,
			// typelibImportPath: "virtual:internal.typelib",
		},
	},
};

export const ConfigProvider = {
	async getConfig(cliArguments: CommandLineArguments): Promise<Config> {
		return await getParsedConfig(cliArguments);
	},
};

async function getParsedConfig(cliArguments: CommandLineArguments): Promise<Config> {
	const root: IRootConfiguration<ConfigReflectionSection> = await (
		await createBuilder(cliArguments.projectRoot)
	).build();
	const packageInfo = getPackageInfo(cliArguments.projectRoot);
	const dependenciesInfo = await getDependenciesInfo(packageInfo, new Logger("Config"));
	return createConfig(cliArguments, root, packageInfo, dependenciesInfo);
}

async function getDependenciesInfo(packageInfo: PackageInfo, logger: Logger): Promise<DependencyInfo[]> {
	const dependenciesInfo: DependencyInfo[] = [];
	const dependencies = Object.keys(packageInfo.packageJson.dependencies ?? {}).concat(
		Object.keys(packageInfo.packageJson.devDependencies ?? [])
	);
	const promises = [];

	for (const packageName of dependencies) {
		const joinedPath = resolvePath(packageInfo.packageRoot, "node_modules", packageName);

		promises.push(
			// biome-ignore lint/suspicious/noAsyncPromiseExecutor: it's okay
			new Promise<void>(async (resolve, _reject) => {
				try {
					// Resolves realpath - removing symlinks.
					const realDirPath = normalizePath(await fs.realpath(joinedPath));

					const dependencyInfo: DependencyInfo = {
						packageName,
						packageRoot: realDirPath,
						pathRegex: new RegExp(`^${realDirPath}`),
						metadataPath: undefined,
						metadataImportSpecifier: undefined,
					};

					const packageJson = await readPackageJson(joinedPath, packageName, logger);

					if (packageJson.reflection) {
						if (packageJson.reflection.metadata) {
							dependencyInfo.metadataPath = normalizePath(
								joinPaths(dependencyInfo.packageRoot, packageJson.reflection.metadata)
							);

							let specifier = removeExtension(packageJson.reflection.metadata.replace(/\\/g, "/"));
							if (specifier.startsWith("./")) {
								specifier = specifier.slice(2);
							}
							dependencyInfo.metadataImportSpecifier = `${packageName}/${specifier}`;
						}
					}

					dependenciesInfo.push(dependencyInfo);
				} catch (e) {
					logger.warn(`Unable to read package.json of package '${packageName}'\n\t${joinedPath}\n\t`, e);
				}
				resolve();
			})
		);
	}

	await Promise.all(promises);

	return dependenciesInfo;
}

async function readPackageJson(joinedPath: string, packageName: any, logger: Logger): Promise<PackageJson> {
	const packageJsonPath = path.join(joinedPath, "package.json");

	try {
		const packageJson = await fs.readFile(packageJsonPath, { encoding: "utf-8" });
		return JSON.parse(packageJson) as PackageJson;
	} catch (e) {
		logger.warn(`Unable to read package.json of package '${packageName}'\n\t${packageJsonPath}\n\t`, e);
	}

	return {};
}

async function createBuilder(configRoot: string) {
	// React config files to get the preset value
	const configFiles = await new ConfigurationBuilder()
		.setRootDirectory(configRoot)
		.addJsonFile("reflect.config.json", { optional: true })
		.addJsFile("reflect.config.js", { optional: true })
		.build();

	const presetName = configFiles.get<ConfigReflectionSection["preset"]>("preset");
	const preset: ConfigReflectionSection =
		typeof presetName === "string" ? (Presets[presetName] ?? DefaultConfiguration) : DefaultConfiguration;

	// Create new configuration builder with given preset as default value
	// MAYDO: configuration files are going to be read again; optimize!
	return new ConfigurationBuilder()
		.setRootDirectory(configRoot)
		.addObject(preset)
		.addJsonFile("reflect.config.json", { optional: true })
		.addJsFile("reflect.config.js", { optional: true });
}

function createConfig(
	commandLineArguments: CommandLineArguments,
	reflectionConfig: IRootConfiguration<ConfigReflectionSection>,
	packageInfo: PackageInfo,
	dependenciesInfo: DependencyInfo[]
): Config {
	const projectRoot = commandLineArguments.projectRoot;
	const metadataConfig = reflectionConfig.getSection("metadata");
	const devMode = ["true", true].includes(reflectionConfig.get("devMode") ?? DefaultConfiguration.devMode);

	let tsParsedCommandLine: ts.ParsedCommandLine | undefined;
	const tsconfig = {
		// getter to lazy-load typescript
		get parsedCommandLine() {
			if (tsParsedCommandLine === undefined) {
				tsParsedCommandLine = getTsConfig(projectRoot);
			}
			return tsParsedCommandLine;
		},
	};

	return {
		packageInfo: packageInfo,
		dependenciesInfo: dependenciesInfo,

		projectRoot: resolvePath(projectRoot),
		normalizedProjectRoot: normalizePath(resolvePath(projectRoot)).replace(/[\\/]+$/, ""),
		get tsRootDir() {
			return resolvePath(tsconfig.parsedCommandLine.options.rootDir ?? projectRoot);
		},
		cacheDir: resolvePath(commandLineArguments.projectRoot, ".metadata"),
		outDir: resolvePath(commandLineArguments.projectRoot, metadataConfig.get("outDir")!),

		watch: commandLineArguments.watch,
		force: commandLineArguments.force,
		typecheck: commandLineArguments.typecheck,

		include: metadataConfig.get("include")!,
		exclude: (metadataConfig.get("exclude") ?? []).concat(
			[".metadata", "**/metadata.typelib.ts", metadataConfig.get("includeDtsFiles") ? null : "**/*.d.ts"].filter(
				(x) => x
			) as string[]
		),

		encode: ["true", true].includes(metadataConfig.get("encode")!),
		target: TargetPlatform[reflectionConfig.get("target") as keyof typeof TargetPlatform],

		// TS OPTIONS
		get compilerOptions() {
			return tsconfig.parsedCommandLine.options;
		},
		get strictNullChecks() {
			return (
				(lazyTypescript.get() as any).getStrictOptionValue?.(
					tsconfig.parsedCommandLine.options,
					"strictNullChecks"
				) ?? tsconfig.parsedCommandLine.options.strictNullChecks === true
			);
		},
		get moduleResolution() {
			return getModuleResolutionKind(tsconfig.parsedCommandLine.options);
		},
		get module() {
			return getModuleKind(tsconfig.parsedCommandLine.options);
		},

		devMode: devMode,
		logLevel: LogLevel[reflectionConfig.get("logLevel") ?? (devMode ? "Debug" : "Warning")],
		dependencyResolution: reflectionConfig.get("dependencyResolution") ?? DefaultConfiguration.dependencyResolution,

		get explicitFileExtensions() {
			const res = this.moduleResolution;
			return (
				res === (TsModuleResolutionKind.Node16 as number) || res === (TsModuleResolutionKind.NodeNext as number)
			);
		},

		// this.plugins = (reflectionConfig.get("plugins") ?? DefaultConfiguration.plugins).map((plugin) =>
		// 	this.getPlugin(plugin, projectRoot)
		// );
		typelibImportPath: metadataConfig.get("typelibImportPath")!,
		metadataTarget: metadataConfig.get("target")!,
	};
}

function getModuleResolutionKind(options: ts.CompilerOptions) {
	const ts = lazyTypescript.get() as any;
	return ts.getEmitModuleResolutionKind?.(options) ?? options.moduleResolution ?? ts.ModuleResolutionKind.Classic;
}

function getModuleKind(compilerOptions: ts.CompilerOptions) {
	const ts = lazyTypescript.get();
	const target = compilerOptions.target ?? ts.ScriptTarget.ES5;

	return (
		compilerOptions.module ??
		([ts.ScriptTarget.ES3, ts.ScriptTarget.ES5].includes(target) ? ts.ModuleKind.CommonJS : ts.ModuleKind.ES2015)
	);
}
