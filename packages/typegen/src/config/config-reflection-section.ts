import { LogLevel } from "../logging";

/**
 * @internal
 */
export type ConfigReflectionSection = {
	/**
	 * Optional section which tells transformer how to generate metadata.
	 */
	metadata: {
		/**
		 * Path where the metadata should be written to.
		 * @default "dist/"
		 */
		outDir: string;

		// /**
		//  * Path (fileName) of metadata index file relative to ourDir.
		//  * @default "metadata.index.json"
		//  */
		// indexPath: string;

		/**
		 * List of glob patterns matching modules which should be included in metadata.
		 */
		include: string[];

		/**
		 * List of glob patterns matching modules which should be excluded from metadata.
		 */
		exclude: string[];

		/**
		 * Enable metadata encoding.
		 * Currently, the base32768 UTF-16 encoding will be used.
		 */
		encode: "true" | "false" | boolean;

		// /**
		//  * Choose EmitType.
		//  * @description This options change metadata typelib emit behavior. Typelib will be emitted as TS or JS file.
		//  * Emit type "ts" is usable for Webpack, Angular (which use Webpack) etc.
		//  * It will generate TS file to project root which can be imported and processed as any other TS src file.
		//  * @default js
		//  */
		// emit: "ts" | "js";
	};

	/**
	 * How to resolve dependencies.
	 * @description This options change how deep should your metadata be. Skipped dependencies will be replaced by "unknown" types.
	 * It can be direct dependencies or all dependencies.
	 * Direct dependencies are dependencies which are directly imported by source file.
	 * All dependencies are all dependencies of source file including dependencies of dependencies.
	 * @example If you have file A with type ClassA with property propA of type ClassB (`class ClassA { propA: ClassB }`) from file B which is from package pkg-B
	 * and ClassB has property propB of type ClassC (`class ClassB { propB: ClassC }`) from file C which is from package pkg-C (not your direct dependency) then:
	 * - direct-dependencies: ClassA will have propA of type ClassB and ClassB will have propB of type unknown,
	 * - all: ClassA will have propA of type ClassB and ClassB will have propB of type ClassC.
	 * - typelibs: Types of any package will not be generated at all, but only typelibs of given packages will be imported.
	 * @default typelibs
	 */
	dependencyResolution: "typelibs" | "direct-dependencies" | "all";

	/**
	 * List of plugins.
	 * @description It is an array of paths and/or package names.
	 */
	plugins: string[];

	/**
	 * Enable or disable DEBUG mode (progress logging and extra warnings).
	 * @default false
	 */
	devMode: "true" | "false" | boolean;

	/**
	 * Level of logging.
	 */
	logLevel: keyof typeof LogLevel;
};

export type OptionalConfigReflectionSection = Partial<Omit<ConfigReflectionSection, "metadata">> & {
	metadata?: Partial<ConfigReflectionSection["metadata"]>;
};
