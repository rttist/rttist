import type * as ts from "typescript";
import type { PackageInfo } from "../../declarations/package-info";
import type { DependencyInfo } from "../../declarations/dependency-info";
import type { ConfigReflectionSection } from "./config-reflection-section";
import type { TargetPlatform } from "../../declarations/target-platform";
import type { LogLevel } from "../logging";

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
	readonly normalizedProjectRoot: string;
	readonly outDir: string;
	readonly cacheDir: string;
	readonly packageInfo: PackageInfo;
	readonly dependenciesInfo: DependencyInfo[];
	readonly encode: boolean;

	readonly useRuntimeGenericClasses: boolean;

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
