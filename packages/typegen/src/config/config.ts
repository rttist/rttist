import { ConfigurationBuilder, IRootConfiguration } from "@netleaf/extensions-configuration";
import { makeRe } from "minimatch";
import * as ts from "typescript";
import { CommandLineArguments } from "../declarations/command-line-arguments";
import type { PackageInfo } from "../declarations/package-info";
import { Logger, LogLevel } from "../logging";
import { resolvePath } from "../utils/path";
// import type { Plugin } from "../plugins";
import { ConfigReflectionSection } from "./config-reflection-section";
import { getPackageInfo } from "./get-package-info";
import { getTsConfig } from "./get-ts-config";

const DefaultConfiguration: ConfigReflectionSection = {
	devMode: false,
	logLevel: "Info",
	dependencyResolution: "typelibs",
	plugins: [],
	metadata: {
		encode: true,
		outDir: "dist/",
		// path: "metadata.typelib.js",
		// indexPath: "metadata.index.json",
		include: ["**/*"],
		exclude: ["**/@types/node/**"],
		// emit: "js"
	},
};

export type Config = {
	readonly devMode: boolean;
	readonly logLevel: LogLevel;

	readonly include: string[];
	readonly exclude: string[];
	// readonly include: RegExp[];
	// readonly exclude: RegExp[];
	readonly dependencyResolution: ConfigReflectionSection["dependencyResolution"];

	// public readonly plugins: Plugin[];

	// public readonly projectDir: string;
	// public readonly rootDir: string;
	readonly projectRoot: string;
	readonly outDir: string;
	readonly packageInfo: PackageInfo;
	readonly encode: boolean;
	// public readonly emit: EmitType;

	// public readonly metadataIndexPath: string;
	// public readonly metadataTypelibPath: string;

	// /**
	//  * "Virtual" for the TypeScript source of typelib metadata from rootDir.
	//  */
	// public readonly metadataTypelibSourcePath: string;

	readonly compilerOptions: ts.CompilerOptions;
	// public readonly parsedCommandLine?: ts.ParsedCommandLine;
	readonly moduleResolution: ts.ModuleResolutionKind;
	readonly module: ts.ModuleKind;
	readonly strictNullChecks: boolean;
};

export async function getParsedConfig(cliArguments: CommandLineArguments) {
	// try {
	const root: IRootConfiguration<ConfigReflectionSection> = await createBuilder(cliArguments.projectRoot).build();

	return createConfig(new Logger("Config"), cliArguments, root, getPackageInfo(cliArguments.projectRoot));
	// } catch (error) {
	// 	logger.error(error.message);
	// 	process.exit(1);
	// }
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

class ConfigParser {
	// // private readonly logger: Logger;
	//
	// public readonly devMode: boolean;
	// public readonly logLevel: LogLevel;
	//
	// public readonly include: RegExp[];
	// public readonly exclude: RegExp[];
	// public readonly dependencyResolution: ConfigReflectionSection["dependencyResolution"];
	//
	// // public readonly plugins: Plugin[];
	//
	// // public readonly projectDir: string;
	// // public readonly rootDir: string;
	// public readonly projectRoot: string;
	// public readonly outDir: string;
	// public readonly packageInfo: PackageInfo;
	// public readonly encode: boolean;
	// // public readonly emit: EmitType;
	//
	// // public readonly metadataIndexPath: string;
	// // public readonly metadataTypelibPath: string;
	//
	// // /**
	// //  * "Virtual" for the TypeScript source of typelib metadata from rootDir.
	// //  */
	// // public readonly metadataTypelibSourcePath: string;
	//
	// public readonly compilerOptions: ts.CompilerOptions;
	// // public readonly parsedCommandLine?: ts.ParsedCommandLine;
	// public readonly moduleResolution: ts.ModuleResolutionKind;
	// public readonly module: ts.ModuleKind;
	// public readonly strictNullChecks: boolean;
	//
	// private constructor(
	// 	private readonly logger: Logger,
	// 	commandLineArguments: CommandLineArguments,
	// 	reflectionConfig: IRootConfiguration<ConfigReflectionSection>,
	// 	packageInfo: PackageInfo
	// 	// compilerOptions: ts.CompilerOptions,
	// 	// programConfig: ProgramConfig /*, program: ts.Program, configSection: OptionalConfigReflectionSection*/
	// ) {
	// 	const projectRoot = commandLineArguments.projectRoot;
	// 	// const reflectionConfig = this.getRootConfiguration(projectRoot, configSection);
	// 	const tsParsedCommandLine = getTsConfig(commandLineArguments);
	//
	// 	this.packageInfo = packageInfo;
	// 	// this.projectDir = projectRoot;
	// 	// this.rootDir = projectRoot;
	//
	// 	const metadataConfig = reflectionConfig.getSection("metadata");
	// 	this.outDir = resolvePath(commandLineArguments.projectRoot, metadataConfig.get("outDir")); //compilerOptions.outDir || projectRoot;
	// 	this.include = (metadataConfig.get("include") ?? []).map((pattern) => this.toRegex(pattern));
	// 	this.exclude = this.createExcludePatterns(metadataConfig.get("exclude"), projectRoot);
	// 	this.encode = ["true", true].includes(metadataConfig.get("encode")!);
	//
	// 	// const compilerOptions = programConfig.tsConfig.options;
	// 	// const compilerOptions = program.getCompilerOptions();
	// 	// const tsConfigPath = (compilerOptions as any).configFilePath;
	// 	// const tsConfigPath = programConfig.rootDir;
	//
	// 	// TS OPTIONS
	// 	this.compilerOptions = tsParsedCommandLine.options;
	// 	this.strictNullChecks =
	// 		(ts as any).getStrictOptionValue?.(this.compilerOptions, "strictNullChecks") ??
	// 		this.compilerOptions.strictNullChecks === true;
	// 	this.moduleResolution = this.getModuleResolutionKind(this.compilerOptions);
	// 	// this.parsedCommandLine = programConfig.tsConfig;
	// 	// this.parsedCommandLine = ts.getParsedCommandLineOfConfigFile(tsConfigPath, undefined, ts.sys as any);
	// 	this.module = this.getModuleKind();
	//
	// 	this.devMode = ["true", true].includes(reflectionConfig.get("devMode") ?? DefaultConfiguration.devMode);
	// 	this.logLevel = LogLevel[reflectionConfig.get("logLevel") ?? (this.devMode ? "Debug" : "Warning")];
	// 	this.dependencyResolution =
	// 		reflectionConfig.get("dependencyResolution") ?? DefaultConfiguration.dependencyResolution;
	//
	// 	// this.plugins = (reflectionConfig.get("plugins") ?? DefaultConfiguration.plugins).map((plugin) =>
	// 	// 	this.getPlugin(plugin, projectRoot)
	// 	// );
	//
	// 	// this.emit =
	// 	// 	(metadataConfig.get("emit") || DefaultConfiguration.metadata.emit) === EmitType.TypeScript
	// 	// 		? EmitType.TypeScript
	// 	// 		: EmitType.JavaScript;
	//
	// 	// INDEX path
	// 	// this.metadataIndexPath = path.join(
	// 	// 	this.outDir,
	// 	// 	metadataConfig.get("indexPath") ?? DefaultConfiguration.metadata.indexPath
	// 	// );
	//
	// 	// TYPELIB path
	// 	// const typeLibPath = metadataConfig.get("path")!;
	// 	// this.metadataTypelibPath = path.join(this.outDir, typeLibPath);
	// 	// this.metadataTypelibSourcePath = path.join(this.rootDir, typeLibPath).replace(/\.js$/, ".ts");
	// }
	// /**
	//  * Returns Regex matching metadata.typelib file.
	//  */
	// private getTypelibSourceRegex() {
	// 	return new RegExp("^" + normalizePath(this.metadataTypelibSourcePath) + "$");
	// }
	// private getPlugin(pluginPath: string, projectRoot: string): Plugin {
	// 	const plugin = require(path.resolve(projectRoot, pluginPath));
	//
	// 	if (!plugin) {
	// 		this.logger.error(`Invalid plugin path/name '${pluginPath}'.`);
	// 	}
	//
	// 	if (!plugin.default) {
	// 		this.logger.error("Plugin must have 'default' export.");
	// 	}
	//
	// 	return plugin.default;
	// }
	// static async getParsedConfig(cliArguments: CommandLineArguments) {
	// 	// try {
	// 	const root: IRootConfiguration<ConfigReflectionSection> = await Config.createBuilder(
	// 		cliArguments.projectRoot
	// 	).build();
	//
	// 	return new Config(new Logger("Config"), cliArguments, root, getPackageInfo(cliArguments.projectRoot));
	// 	// } catch (error) {
	// 	// 	logger.error(error.message);
	// 	// 	process.exit(1);
	// 	// }
	// }
	//
	// private static createBuilder(configRoot: string /*, transformerConfigSection: OptionalConfigReflectionSection*/) {
	// 	return (
	// 		new ConfigurationBuilder()
	// 			.setRootDirectory(configRoot)
	// 			.addObject(DefaultConfiguration)
	// 			// .addObject(transformerConfigSection)
	// 			.addJsonFile("reflect.config.json", { optional: true /*, synchronous: true*/ })
	// 			.addJsFile("reflect.config.js", { optional: true /*, synchronous: true*/ })
	// 	);
	// }
	// /**
	//  * Builds and returns root configuration.
	//  * @param projectRoot
	//  * @param transformerConfigSection
	//  * @private
	//  */
	// private getRootConfiguration(
	// 	projectRoot: string,
	// 	transformerConfigSection: OptionalConfigReflectionSection
	// ): IRootConfiguration<ConfigReflectionSection> {
	// 	const configBuilder: IConfigurationBuilder = this.createBuilder(projectRoot, transformerConfigSection);
	// 	return configBuilder.buildSync();
	// }
}
function createConfig(
	logger: Logger,
	commandLineArguments: CommandLineArguments,
	reflectionConfig: IRootConfiguration<ConfigReflectionSection>,
	packageInfo: PackageInfo
	// compilerOptions: ts.CompilerOptions,
	// programConfig: ProgramConfig /*, program: ts.Program, configSection: OptionalConfigReflectionSection*/
): Config {
	const projectRoot = commandLineArguments.projectRoot;
	// const reflectionConfig = this.getRootConfiguration(projectRoot, configSection);
	const tsParsedCommandLine = getTsConfig(commandLineArguments);

	// this.packageInfo = packageInfo;
	// this.projectDir = projectRoot;
	// this.rootDir = projectRoot;

	const metadataConfig = reflectionConfig.getSection("metadata");
	const devMode = ["true", true].includes(reflectionConfig.get("devMode") ?? DefaultConfiguration.devMode);

	return {
		packageInfo: packageInfo,
		projectRoot: projectRoot,

		outDir: resolvePath(commandLineArguments.projectRoot, metadataConfig.get("outDir")!), //compilerOptions.outDir || projectRoot;
		include: metadataConfig.get("include")!,
		exclude: metadataConfig.get("exclude") ?? [], // TODO: Check if it must be fixed because of relative paths
		// include: (metadataConfig.get("include") ?? []).map((pattern) => toRegex(pattern, logger)),
		// exclude: createExcludePatterns(metadataConfig.get("exclude"), projectRoot, logger),
		encode: ["true", true].includes(metadataConfig.get("encode")!),

		// const compilerOptions = programConfig.tsConfig.options;
		// const compilerOptions = program.getCompilerOptions();
		// const tsConfigPath = (compilerOptions as any).configFilePath;
		// const tsConfigPath = programConfig.rootDir;

		// TS OPTIONS
		compilerOptions: tsParsedCommandLine.options,
		strictNullChecks:
			(ts as any).getStrictOptionValue?.(tsParsedCommandLine.options, "strictNullChecks") ??
			tsParsedCommandLine.options.strictNullChecks === true,
		moduleResolution: getModuleResolutionKind(tsParsedCommandLine.options),
		// this.parsedCommandLine = programConfig.tsConfig;
		// this.parsedCommandLine = ts.getParsedCommandLineOfConfigFile(tsConfigPath, undefined, ts.sys as any);
		module: getModuleKind(tsParsedCommandLine.options),

		devMode: devMode,
		logLevel: LogLevel[reflectionConfig.get("logLevel") ?? (devMode ? "Debug" : "Warning")],
		dependencyResolution: reflectionConfig.get("dependencyResolution") ?? DefaultConfiguration.dependencyResolution,

		// this.plugins = (reflectionConfig.get("plugins") ?? DefaultConfiguration.plugins).map((plugin) =>
		// 	this.getPlugin(plugin, projectRoot)
		// );

		// this.emit =
		// 	(metadataConfig.get("emit") || DefaultConfiguration.metadata.emit) === EmitType.TypeScript
		// 		? EmitType.TypeScript
		// 		: EmitType.JavaScript;

		// INDEX path
		// this.metadataIndexPath = path.join(
		// 	this.outDir,
		// 	metadataConfig.get("indexPath") ?? DefaultConfiguration.metadata.indexPath
		// );

		// TYPELIB path
		// const typeLibPath = metadataConfig.get("path")!;
		// this.metadataTypelibPath = path.join(this.outDir, typeLibPath);
		// this.metadataTypelibSourcePath = path.join(this.rootDir, typeLibPath).replace(/\.js$/, ".ts");
	};
}

function toRegex(pattern: string, logger: Logger): RegExp {
	const regex = makeRe(pattern, { partial: true, dot: true });

	if (!regex) {
		logger.error(`Invalid glob pattern '${pattern}'.`);
		// Return regex matching nothing.
		return /(?!)/;
	}

	return regex;
}

/**
 * Returns a list of exclude regexes.
 * @param excludes
 * @param projectRoot
 * @param logger
 */
function createExcludePatterns<TConfig, TVal, TSection>(
	excludes: string[] | undefined,
	projectRoot: string,
	logger: Logger
): RegExp[] {
	return (excludes ?? []).map((pattern) => {
		if (pattern.startsWith("./")) {
			pattern = (projectRoot.endsWith("/") ? projectRoot.slice(0, -1) : projectRoot) + "/" + pattern.slice(2);
		}

		return toRegex(pattern, logger);
	});
	// Exclude typelib from sources.
	// .concat([this.getTypelibSourceRegex()])
}

function getModuleResolutionKind(options: ts.CompilerOptions) {
	return (
		(ts as any).getEmitModuleResolutionKind?.(options) ??
		options.moduleResolution ??
		ts.ModuleResolutionKind.Classic
	);
}

function getModuleKind(compilerOptions: ts.CompilerOptions) {
	const target = compilerOptions.target ?? ts.ScriptTarget.ES5;

	return (
		compilerOptions.module ??
		([ts.ScriptTarget.ES3, ts.ScriptTarget.ES5].includes(target) ? ts.ModuleKind.CommonJS : ts.ModuleKind.ES2015)
	);
}
