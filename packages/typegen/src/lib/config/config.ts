import type * as ts from "typescript";
import type { PackageInfo } from "../../declarations/package-info";
import type { DependencyInfo } from "../../declarations/dependency-info";
import type { PackageJson } from "../../declarations/package-json";
import type { ConfigReflectionSection } from "./config-reflection-section";
import { ConfigurationBuilder, IRootConfiguration } from "@netleaf/extensions-configuration";
import fs from "fs/promises";
import path from "path";
import { CommandLineArguments } from "../../declarations/command-line-arguments";
import { TargetPlatform } from "../../declarations/target-platform";
import { Logger, LogLevel } from "../logging";
import { joinPaths, normalizePath, resolvePath } from "../utils/path";
import { getPackageInfo } from "./get-package-info";
import { getTsConfig } from "./get-ts-config";
import { lazyTypescript } from "../utils/lazy-typescript";

const DefaultConfiguration: ConfigReflectionSection = {
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
		// emit: "js"
	},
};

export type Config = {
	readonly devMode: boolean;
	readonly logLevel: LogLevel;
	readonly watch: boolean;
	readonly force: boolean;
	readonly typecheck: boolean;
	readonly target: TargetPlatform;

	readonly include: string[];
	readonly exclude: string[];

	readonly dependencyResolution: ConfigReflectionSection["dependencyResolution"];

	// public readonly plugins: Plugin[];
	readonly tsRootDir: string;
	readonly projectRoot: string;
	readonly outDir: string;
	readonly cacheDir: string;
	readonly packageInfo: PackageInfo;
	readonly dependenciesInfo: DependencyInfo[];
	readonly encode: boolean;

	// public readonly metadataIndexPath: string;
	// public readonly metadataTypelibPath: string;

	// /**
	//  * "Virtual" for the TypeScript source of typelib metadata from rootDir.
	//  */
	// public readonly metadataTypelibSourcePath: string;

	readonly compilerOptions: ts.CompilerOptions;
	readonly moduleResolution: ts.ModuleResolutionKind;
	readonly module: ts.ModuleKind;
	readonly strictNullChecks: boolean;
};

async function getDependenciesInfo(packageInfo: PackageInfo, logger: Logger): Promise<DependencyInfo[]> {
	const dependenciesInfo: DependencyInfo[] = [];
	const dependencies = Object.keys(packageInfo.packageJson.dependencies ?? {}).concat(
		Object.keys(packageInfo.packageJson.devDependencies ?? [])
	);
	const promises = [];

	for (const packageName of dependencies) {
		const joinedPath = resolvePath(packageInfo.packageRoot, "node_modules", packageName);

		promises.push(
			new Promise<void>(async (resolve, reject) => {
				try {
					// Resolves realpath - removing symlinks.
					const realDirPath = normalizePath(await fs.realpath(joinedPath));

					const dependencyInfo: DependencyInfo = {
						packageName,
						packageRoot: realDirPath,
						pathRegex: new RegExp("^" + realDirPath),
						metadataPath: undefined,
					};

					const packageJson = await readPackageJson(joinedPath, packageName, logger);

					if (packageJson.reflection) {
						if (packageJson.reflection.metadata) {
							dependencyInfo.metadataPath = normalizePath(
								joinPaths(dependencyInfo.packageRoot, packageJson.reflection.metadata)
							);
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

export async function getParsedConfig(cliArguments: CommandLineArguments): Promise<Config> {
	const root: IRootConfiguration<ConfigReflectionSection> = await createBuilder(cliArguments.projectRoot).build();
	const packageInfo = getPackageInfo(cliArguments.projectRoot);
	const dependenciesInfo = await getDependenciesInfo(packageInfo, new Logger("Config"));
	return createConfig(cliArguments, root, packageInfo, dependenciesInfo);
}

function createBuilder(configRoot: string /*, transformerConfigSection: OptionalConfigReflectionSection*/) {
	return (
		new ConfigurationBuilder()
			.setRootDirectory(configRoot)
			.addObject(DefaultConfiguration)
			// .addObject(transformerConfigSection)
			.addJsonFile("reflect.config.json", { optional: true /*, synchronous: true*/ })
			.addJsFile("reflect.config.js", { optional: true /*, synchronous: true*/ })
	);
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
				tsParsedCommandLine = getTsConfig(commandLineArguments);
			}
			return tsParsedCommandLine;
		},
	};

	return {
		packageInfo: packageInfo,
		dependenciesInfo: dependenciesInfo,

		projectRoot: resolvePath(projectRoot),
		get tsRootDir() {
			return resolvePath(tsconfig.parsedCommandLine.options.rootDir ?? projectRoot);
		},
		cacheDir: resolvePath(commandLineArguments.projectRoot, ".metadata"),
		outDir: resolvePath(commandLineArguments.projectRoot, metadataConfig.get("outDir")!),

		watch: commandLineArguments.watch,
		force: commandLineArguments.force,
		typecheck: commandLineArguments.typecheck,

		include: metadataConfig.get("include")!,
		exclude: (metadataConfig.get("exclude") ?? []).concat([".metadata", "**/metadata.typelib.ts"]),

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

		// this.plugins = (reflectionConfig.get("plugins") ?? DefaultConfiguration.plugins).map((plugin) =>
		// 	this.getPlugin(plugin, projectRoot)
		// );
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
