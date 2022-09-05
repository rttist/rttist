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

export const DEFAULT_METADATA_TYPELIB_FILE_NAME = "metadata.typelib.js";
export const DEFAULT_METADATA_INDEX_FILE_NAME = "metadata.index.json";
export const DEFAULT_TYPELIB_FACTORY = "__τ";

const UNKNOWN_PACKAGE_NAME = "@@this";

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

	public readonly metadataIndexPath: string;
	public readonly metadataTypelibPath: string;

	/**
	 * Virtual path (TS context) from rootDir.
	 * There will never exists any typelib file. It's just a path, where its TS file would be.
	 */
	public readonly metadataTypelibVirtualPath: string;
	
	public readonly encode: boolean;

	public readonly compilerOptions: ts.CompilerOptions;

	constructor(program: ts.Program, configSection: OptionalConfigReflectionSection)
	{
		const options = this.ensure(configSection);
		const compilerOptions = program.getCompilerOptions();
		const projectRoot = path.dirname((compilerOptions as any).configFilePath || compilerOptions.rootDir);
		const packageInfo = this.getPackage(projectRoot);

		this.debugMode = ["true", true].includes(options.debugMode);

		this.include = options.metadata.include.map(pattern => this.toRegex(pattern));
		this.exclude = options.metadata.exclude.map(pattern => this.toRegex(pattern));

		this.plugins = options.plugins.map(plugin => this.getPlugin(plugin, projectRoot));
		this.metadataMiddlewares = options.metadata.middlewares.map(middleware => this.getMiddleware(middleware, projectRoot));

		this.projectDir = projectRoot;
		this.rootDir = compilerOptions.rootDir || projectRoot;
		this.outDir = compilerOptions.outDir || projectRoot;
		this.packageName = packageInfo.name;
		this.typeFactory = options.metadata.typeFactory;

		this.metadataIndexPath = path.join(this.outDir, options.metadata.metadataIndexPath);
		this.metadataTypelibPath = path.join(this.outDir, options.metadata.metadataTypelibPath);
		this.metadataTypelibVirtualPath = path.join(this.rootDir, options.metadata.metadataTypelibPath);
		
		this.encode = ["true", true].includes(options.metadata.encode);

		this.compilerOptions = compilerOptions;
	}

	/**
	 * Returns "reflection" section from config; assigned over default values.
	 * @param configSection
	 */
	ensure(configSection: OptionalConfigReflectionSection): ConfigReflectionSection
	{
		configSection.metadata ??= {};

		const debugMode = configSection.debugMode || false;

		return {
			debugMode: debugMode,
			plugins: configSection.plugins || [],

			metadata: {
				metadataTypelibPath: configSection.metadata.metadataTypelibPath?.toString() || DEFAULT_METADATA_TYPELIB_FILE_NAME,
				metadataIndexPath: configSection.metadata.metadataIndexPath?.toString() || DEFAULT_METADATA_INDEX_FILE_NAME,
				typeFactory: configSection.metadata.typeFactory || DEFAULT_TYPELIB_FACTORY,
				middlewares: configSection.metadata.middlewares || [],
				include: configSection.metadata.include || [],
				exclude: configSection.metadata.exclude || [],
				encode: configSection.metadata.encode || !debugMode
			}
		};
	}

	/**
	 * Get name and root directory of the package.
	 * @description If no package found, original root and unknown name (@@this) is returned.
	 * @return {string}
	 * @private
	 */
	getPackage(root: string, recursiveCheck: boolean = false): PackageInfo
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

	getPlugin(pluginPath: string, projectRoot: string): SourceFileVisitorPlugin
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

	getMiddleware(middlewarePath: string, projectRoot: string): MetadataMiddleware
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

	toRegex(pattern: string): RegExp
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
}