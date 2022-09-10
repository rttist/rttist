import {
	ConfigurationBuilder,
	IConfigurationBuilder,
	IRootConfiguration
}                                       from "@netleaf/extensions-configuration";
import * as deasync                     from "deasync";
import type { MetadataMiddleware }      from "../middlewares";
import type { SourceFileVisitorPlugin } from "../plugins";
import fs                               from "fs";
import path                             from "path";
import * as ts                          from "typescript";
import { makeRe }                       from "minimatch";
import { PackageInfo }                  from "../declarations/general";
import { log }                          from "../log";
import {
	ConfigReflectionSection,
	OptionalConfigReflectionSection
}                                       from "./ConfigReflectionSection";

const UNKNOWN_PACKAGE_NAME = "@@this";

const DefaultConfiguration: ConfigReflectionSection = {
	debugMode: false,
	plugins: [],
	metadata: {
		encode: true,
		metadataTypelibPath: "metadata.typelib.js",
		metadataIndexPath: "metadata.index.json",
		typeFactory: "__τ",
		middlewares: [],
		include: ["**/*"],
		exclude: []
	}
};

export class Config
{
	public readonly debugMode: boolean;

	public readonly include: RegExp[];
	public readonly exclude: RegExp[];

	public readonly plugins: SourceFileVisitorPlugin[];
	public readonly metadataMiddlewares: MetadataMiddleware[];

	public readonly projectDir: string;
	public readonly rootDir: string;
	public readonly outDir: string;
	public readonly packageName: string;
	public readonly typeFactory: string;
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

		this.debugMode = ["true", true].includes(reflectionConfig.get("debugMode")!);
		this.compilerOptions = compilerOptions;
		this.parsedCommandLine = ts.getParsedCommandLineOfConfigFile(tsConfigPath, undefined, ts.sys as any);

		this.include = metadataConfig.get("include")!.map(pattern => this.toRegex(pattern));
		this.exclude = metadataConfig.get("exclude")!.map(pattern => this.toRegex(pattern));

		this.plugins = reflectionConfig.get("plugins")!.map(plugin => this.getPlugin(plugin, projectRoot));
		this.metadataMiddlewares = metadataConfig.get("middlewares")!.map(middleware => this.getMiddleware(
			middleware,
			projectRoot
		));

		this.projectDir = projectRoot;
		this.rootDir = compilerOptions.rootDir || projectRoot;
		this.outDir = compilerOptions.outDir || projectRoot;
		this.packageName = packageInfo.name;
		this.typeFactory = metadataConfig.get("typeFactory")!;
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

		let done = false;
		let configuration: IRootConfiguration<ConfigReflectionSection>;

		configBuilder.build().then(config => {
			configuration = config;
			done = true;
		});

		deasync.loopWhile(() => !done);

		return configuration!;
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
			return { packageRoot: root, name: JSON.parse(packageJson).name || UNKNOWN_PACKAGE_NAME };
		}
		catch (e)
		{
			if (path.parse(root).root === root)
			{
				// as any -> internal
				return { packageRoot: undefined as any, name: UNKNOWN_PACKAGE_NAME };
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
				return { packageRoot: root, name: packageInfo.name };
			}

			return packageInfo;
		}
	}

	private getPlugin(pluginPath: string, projectRoot: string): SourceFileVisitorPlugin
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

	private getMiddleware(middlewarePath: string, projectRoot: string): MetadataMiddleware
	{
		const middleware = require(path.resolve(projectRoot, middlewarePath));

		if (!middleware)
		{
			log.error(`Invalid middleware path/name '${middlewarePath}'.`);
		}

		if (!middleware.default)
		{
			log.error("Middleware must have 'default' export.");
		}

		return middleware.default;
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
}