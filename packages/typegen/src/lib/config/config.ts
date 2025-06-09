import type * as ts from "typescript";
import { ModuleResolutionKind } from "typescript";
import type { PackageInfo } from "../../declarations/package-info";
import type { DependencyInfo } from "../../declarations/dependency-info";
import type { PackageJson } from "../../declarations/package-json";
import type { ConfigReflectionSection } from "./config-reflection-section";
import { ConfigurationBuilder, type IRootConfiguration } from "@netleaf/extensions-configuration";
import fs from "fs/promises";
import path from "path";
import type { CommandLineArguments } from "../../declarations/command-line-arguments";
import { TargetPlatform } from "../../declarations/target-platform";
import { Logger, LogLevel } from "../logging";
import { joinPaths, normalizePath, resolvePath } from "../utils/path";
import { getPackageInfo } from "./get-package-info";
import { getTsConfig } from "./get-ts-config";
import { lazyTypescript } from "../utils/lazy-typescript";
import { removeExtension } from "../transformer/utils/remove-extension";

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
	readonly explicitFileExtensions: boolean;

	readonly typelibImportPath: string;
	readonly metadataTarget: string;
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

export async function getParsedConfig(cliArguments: CommandLineArguments): Promise<Config> {
	const root: IRootConfiguration<ConfigReflectionSection> = await (
		await createBuilder(cliArguments.projectRoot)
	).build();
	const packageInfo = getPackageInfo(cliArguments.projectRoot);
	const dependenciesInfo = await getDependenciesInfo(packageInfo, new Logger("Config"));
	return createConfig(cliArguments, root, packageInfo, dependenciesInfo);
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
			return res === ModuleResolutionKind.Node16 || res === ModuleResolutionKind.NodeNext;
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
