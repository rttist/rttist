import {
	ConfigurationBuilder,
	IConfigurationBuilder,
	IRootConfiguration
}                                  from "@netleaf/extensions-configuration";
import {awaitSync}                from "@kaciras/deasync";
import type { Plugin }             from "../plugins";
import fs                          from "fs";
import path                        from "path";
import * as ts                     from "typescript";
import { makeRe }                  from "minimatch";
import {
	PackageInfo,
	PackageJson
}                                  from "../declarations/general";
import {
	log,
	LogLevel
}                                  from "../logging";
import {
	ConfigReflectionSection,
	OptionalConfigReflectionSection
}                                  from "./ConfigReflectionSection";

const UNKNOWN_PACKAGE_NAME = "@@this";

const DefaultConfiguration: ConfigReflectionSection = {
	devMode: false,
	logLevel: undefined!,
	dependencyResolution: "direct-dependencies",
	plugins: [],
	metadata: {
		encode: true,
		metadataTypelibPath: "metadata.typelib.js",
		metadataIndexPath: "metadata.index.json",
		include: ["**/*"],
		exclude: []
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

	public readonly metadataIndexPath: string;
	public readonly metadataTypelibPath: string;

	/**
	 * Virtual path (TS context) from rootDir.
	 * There will never exists any typelib file. It's just a path, where its TS file would be.
	 */
	public readonly metadataTypelibVirtualPath: string;

	public readonly compilerOptions: ts.CompilerOptions;
	public readonly parsedCommandLine?: ts.ParsedCommandLine;
	public readonly moduleResolution: ts.ModuleResolutionKind;
	public readonly strictNullChecks: boolean;

	constructor(program: ts.Program, configSection: OptionalConfigReflectionSection)
	{
		// const options = this.ensure(configSection);
		const compilerOptions = program.getCompilerOptions();
		const tsConfigPath = (compilerOptions as any).configFilePath;
		const projectRoot = path.dirname(tsConfigPath || compilerOptions.rootDir);
		const packageInfo = this.getPackage(projectRoot);

		const reflectionConfig = this.getRootConfiguration(projectRoot, configSection);
		const metadataConfig = reflectionConfig.getSection("metadata");
		const typeLibPath = metadataConfig.get("metadataTypelibPath")!;

		this.devMode = ["true", true].includes(reflectionConfig.get("devMode")!);
		this.logLevel = LogLevel[reflectionConfig.get("logLevel")! ?? (this.devMode ? "Debug" : "Warning")];
		this.dependencyResolution = reflectionConfig.get("dependencyResolution")!;

		this.compilerOptions = compilerOptions;
		this.strictNullChecks = (ts as any).getStrictOptionValue?.(compilerOptions, "strictNullChecks") 
			?? compilerOptions.strictNullChecks === true;
		this.moduleResolution = this.getModuleResolutionKind(compilerOptions);
		this.parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
			tsConfigPath,
			undefined,
			ts.sys as any
		);

		this.include = metadataConfig.get("include")!.map(pattern => this.toRegex(pattern));
		this.exclude = metadataConfig.get("exclude")!.map(pattern => this.toRegex(pattern));

		this.plugins = reflectionConfig.get("plugins")!.map(plugin => this.getPlugin(plugin, projectRoot));

		this.projectDir = projectRoot;
		this.rootDir = compilerOptions.rootDir || projectRoot;
		this.outDir = compilerOptions.outDir || projectRoot;
		this.packageInfo = packageInfo;
		this.encode = ["true", true].includes(metadataConfig.get("encode")!);

		this.metadataIndexPath = path.join(this.outDir, metadataConfig.get("metadataIndexPath")!);
		this.metadataTypelibPath = path.join(this.outDir, typeLibPath);
		this.metadataTypelibVirtualPath = path.join(this.rootDir, typeLibPath);
	}

	getRootConfiguration(
		projectRoot: string,
		transformerConfigSection: OptionalConfigReflectionSection
	): IRootConfiguration<ConfigReflectionSection>
	{
		const configBuilder: IConfigurationBuilder = this.createBuilder(projectRoot, transformerConfigSection);
		return awaitSync(configBuilder.build());
	}

	/**
	 * Get name and root directory of the package.
	 * @description If no package found, original root and unknown name (@@this) is returned.
	 * @return {string}
	 * @private
	 */
	private getPackage(root: string, recursiveCheck: boolean = false): PackageInfo
	{
		try
		{
			const packageJson = fs.readFileSync(path.join(root, "package.json"), "utf-8");
			const parsed: PackageJson = JSON.parse(packageJson);
			return {
				packageRoot: root,
				name: parsed.name || UNKNOWN_PACKAGE_NAME,
				packageJson: parsed
			};
		}
		catch (e)
		{
			if (path.parse(root).root === root)
			{
				// as any -> internal
				return {
					packageRoot: undefined as any,
					name: UNKNOWN_PACKAGE_NAME,
					packageJson: {}
				};
			}

			// Try to get parent folder package
			const packageInfo = this.getPackage(path.normalize(path.join(root, "..")), true);

			if (packageInfo.packageRoot === undefined)
			{
				// If this is recursive check, return undefined root as received from parent folder check
				if (recursiveCheck)
				{
					return packageInfo;
				}

				// This is top level check; return original root passed as argument
				return { packageRoot: root, name: packageInfo.name, packageJson: packageInfo.packageJson };
			}

			return packageInfo;
		}
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
		const regex = makeRe(pattern);

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
			.addJsonFile("reflect.config.json", { optional: true })
			.addJsFile("reflect.config.js", { optional: true });
	}

	private getModuleResolutionKind(options: ts.CompilerOptions)
	{
		return (ts as any).getEmitModuleResolutionKind?.(options)
			?? options.moduleResolution
			?? ts.ModuleResolutionKind.Classic;
	}
}