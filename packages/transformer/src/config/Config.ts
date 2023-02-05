import {
	ConfigurationBuilder,
	IConfigurationBuilder,
	IRootConfiguration
}                           from "@netleaf/extensions-configuration";
import { makeRe }           from "minimatch";
import path                 from "path";
import * as ts              from "typescript";
import { EmitType }         from "../declarations/EmitType";
import type { PackageInfo } from "../declarations/general";
import {
	log,
	LogLevel
}                           from "../logging";
import type { Plugin }      from "../plugins";
import { normalizePath }    from "../utils/normalizePath";
import {
	ConfigReflectionSection,
	OptionalConfigReflectionSection
}                           from "./ConfigReflectionSection";
import { getPackageInfo }   from "./getPackageInfo";

const DefaultConfiguration: ConfigReflectionSection = {
	devMode: false,
	logLevel: undefined!,
	dependencyResolution: "direct-dependencies",
	plugins: [],
	metadata: {
		encode: true,
		path: "metadata.typelib.js",
		indexPath: "metadata.index.json",
		include: ["**/*"],
		exclude: ["**/@types/node/**"],
		emit: "js"
	}
};

export class Config
{
	public readonly devMode: boolean;
	public readonly logLevel: LogLevel;

	public readonly include: RegExp[];
	public readonly exclude: RegExp[];
	public readonly dependencyResolution: ConfigReflectionSection["dependencyResolution"];

	public readonly plugins: Plugin[];

	public readonly projectDir: string;
	public readonly rootDir: string;
	public readonly outDir: string;
	public readonly packageInfo: PackageInfo;
	public readonly encode: boolean;
	public readonly emit: EmitType;

	public readonly metadataIndexPath: string;
	public readonly metadataTypelibPath: string;

	/**
	 * "Virtual" for the TypeScript source of typelib metadata from rootDir.
	 */
	public readonly metadataTypelibSourcePath: string;

	public readonly compilerOptions: ts.CompilerOptions;
	public readonly parsedCommandLine?: ts.ParsedCommandLine;
	public readonly moduleResolution: ts.ModuleResolutionKind;
	public readonly module: ts.ModuleKind;
	public readonly strictNullChecks: boolean;

	constructor(program: ts.Program, configSection: OptionalConfigReflectionSection)
	{
		const compilerOptions = program.getCompilerOptions();
		const tsConfigPath = (compilerOptions as any).configFilePath;

		// TS OPTIONS
		this.compilerOptions = compilerOptions;
		this.strictNullChecks = (ts as any).getStrictOptionValue?.(compilerOptions, "strictNullChecks")
			?? compilerOptions.strictNullChecks === true;
		this.moduleResolution = this.getModuleResolutionKind(compilerOptions);
		this.parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
			tsConfigPath,
			undefined,
			ts.sys as any
		);
		this.module = this.getModuleKind();

		const projectRoot = path.dirname(tsConfigPath || compilerOptions.rootDir);
		const reflectionConfig = this.getRootConfiguration(projectRoot, configSection);
		const metadataConfig = reflectionConfig.getSection("metadata");

		this.devMode = ["true", true].includes(reflectionConfig.get("devMode") ?? DefaultConfiguration.devMode);
		this.logLevel = LogLevel[reflectionConfig.get("logLevel") ?? (this.devMode ? "Debug" : "Warning")];
		this.dependencyResolution = reflectionConfig.get("dependencyResolution") ?? DefaultConfiguration.dependencyResolution;
		this.plugins = (reflectionConfig.get("plugins") ?? DefaultConfiguration.plugins)
			.map(plugin => this.getPlugin(plugin, projectRoot));

		this.projectDir = projectRoot;
		this.rootDir = compilerOptions.rootDir || projectRoot;
		this.outDir = compilerOptions.outDir || projectRoot;
		this.packageInfo = getPackageInfo(projectRoot);
		this.encode = ["true", true].includes(metadataConfig.get("encode")!);
		this.emit = (metadataConfig.get("emit") || DefaultConfiguration.metadata.emit) === EmitType.TypeScript
			? EmitType.TypeScript
			: EmitType.JavaScript;

		// INDEX path
		this.metadataIndexPath = path.join(
			this.outDir,
			metadataConfig.get("indexPath") ?? DefaultConfiguration.metadata.indexPath
		);

		// TYPELIB path
		const typeLibPath = metadataConfig.get("path")!;
		this.metadataTypelibPath = path.join(this.outDir, typeLibPath);
		this.metadataTypelibSourcePath = path.join(this.rootDir, typeLibPath).replace(/\.js$/, ".ts");

		// INCLUDE / EXCLUDE
		this.include = (metadataConfig.get("include") ?? []).map(pattern => this.toRegex(pattern));
		this.exclude = this.createExcludePatterns(metadataConfig.get("exclude"), projectRoot);
	}

	/**
	 * Returns a list of exclude regexes.
	 * @param excludes
	 * @param projectRoot
	 * @private
	 */
	private createExcludePatterns<TConfig, TVal, TSection>(
		excludes: string[] | undefined,
		projectRoot: string
	): RegExp[]
	{
		return (excludes ?? [])
			.map(pattern => {
				if (pattern.startsWith("./"))
				{
					pattern = (projectRoot.endsWith("/")
							? projectRoot.slice(0, -1)
							: projectRoot
					) + "/" + pattern.slice(2);
				}

				return this.toRegex(pattern);
			})
			.concat([this.getTypelibSourceRegex()]);
	}

	/**
	 * Builds and returns root configuration.
	 * @param projectRoot
	 * @param transformerConfigSection
	 * @private
	 */
	private getRootConfiguration(
		projectRoot: string,
		transformerConfigSection: OptionalConfigReflectionSection
	): IRootConfiguration<ConfigReflectionSection>
	{
		const configBuilder: IConfigurationBuilder = this.createBuilder(projectRoot, transformerConfigSection);
		return configBuilder.buildSync();
	}

	/**
	 * Returns Regex matching metadata.typelib file.
	 */
	private getTypelibSourceRegex()
	{
		return new RegExp(
			"^" + normalizePath(this.metadataTypelibSourcePath) + "$"
		);
	}

	private getPlugin(pluginPath: string, projectRoot: string): Plugin
	{
		const plugin = require(path.resolve(projectRoot, pluginPath));

		if (!plugin)
		{
			log.error(`Invalid plugin path/name '${pluginPath}'.`);
		}

		if (!plugin.default)
		{
			log.error("Plugin must have 'default' export.");
		}

		return plugin.default;
	}

	private toRegex(pattern: string): RegExp
	{
		const regex = makeRe(pattern, { partial: true, dot: true });

		if (!regex)
		{
			log.error(`Invalid glob pattern '${pattern}'.`);
			// Return regex matching nothing.
			return /(?!)/;
		}

		return regex;
	}

	private createBuilder(
		projectRoot: string,
		transformerConfigSection: OptionalConfigReflectionSection
	)
	{
		return new ConfigurationBuilder()
			.setRootDirectory(projectRoot)
			.addObject(DefaultConfiguration)
			.addObject(transformerConfigSection)
			.addJsonFile("reflect.config.json", { optional: true, synchronous: true })
			.addJsFile("reflect.config.js", { optional: true, synchronous: true });
	}

	private getModuleResolutionKind(options: ts.CompilerOptions)
	{
		return (ts as any).getEmitModuleResolutionKind?.(options)
			?? options.moduleResolution
			?? ts.ModuleResolutionKind.Classic;
	}

	private getModuleKind()
	{
		const target = this.compilerOptions.target ?? this.parsedCommandLine?.options.target ?? ts.ScriptTarget.ES5;

		return this.compilerOptions.module ?? this.parsedCommandLine?.options.module ?? (
			[ts.ScriptTarget.ES3, ts.ScriptTarget.ES5].includes(target) ? ts.ModuleKind.CommonJS : ts.ModuleKind.ES2015
		);
	}
}