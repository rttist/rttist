import { ConfigurationBuilder, IRootConfiguration } from "@netleaf/extensions-configuration";
import { makeRe } from "minimatch";
import * as ts from "typescript";
import { CommandLineArguments } from "../declarations/command-line-arguments";
import type { PackageInfo } from "../declarations/package-info";
import { Logger, LogLevel } from "../logging";
import { resolvePath } from "../utils/path";
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
	const root: IRootConfiguration<ConfigReflectionSection> = await createBuilder(cliArguments.projectRoot).build();
	return createConfig(new Logger("Config"), cliArguments, root, getPackageInfo(cliArguments.projectRoot));
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
	logger: Logger,
	commandLineArguments: CommandLineArguments,
	reflectionConfig: IRootConfiguration<ConfigReflectionSection>,
	packageInfo: PackageInfo
): Config {
	const projectRoot = commandLineArguments.projectRoot;
	const tsParsedCommandLine = getTsConfig(commandLineArguments);
	const metadataConfig = reflectionConfig.getSection("metadata");
	const devMode = ["true", true].includes(reflectionConfig.get("devMode") ?? DefaultConfiguration.devMode);

	return {
		packageInfo: packageInfo,
		projectRoot: projectRoot,

		watch: commandLineArguments.watch,
		force: commandLineArguments.force,

		outDir: resolvePath(commandLineArguments.projectRoot, metadataConfig.get("outDir")!),
		include: metadataConfig.get("include")!,
		exclude: metadataConfig.get("exclude") ?? [], // TODO: Check if it must be fixed because of relative paths
		encode: ["true", true].includes(metadataConfig.get("encode")!),

		// TS OPTIONS
		compilerOptions: tsParsedCommandLine.options,
		strictNullChecks:
			(ts as any).getStrictOptionValue?.(tsParsedCommandLine.options, "strictNullChecks") ??
			tsParsedCommandLine.options.strictNullChecks === true,
		moduleResolution: getModuleResolutionKind(tsParsedCommandLine.options),
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
