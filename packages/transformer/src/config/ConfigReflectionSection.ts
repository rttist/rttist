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
		 * Path (fileName) of metadata type library relative to ourDir.
		 * @default "metadata.typelib.js"
		 */
		metadataTypelibPath: string;
		
		/**
		 * Path (fileName) of metadata index file relative to ourDir.
		 * @default "metadata.index.json"
		 */
		metadataIndexPath: string;

		/**
		 * Name of the runtime type factory function.
		 * @default "__τ"
		 */
		typeFactory: string;

		/**
		 * Optional list of metadata middlewares.
		 * @description It is an array of paths and/or package names.
		 */
		middlewares: string[];

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
		encode: "true" | "false"| boolean;
	};

	/**
	 * How to resolve dependencies.
	 */
	dependencyResolution: "direct-dependencies" | "all";

	/**
	 * List of SourceFile visiting plugins with possible transformations.
	 * @description It is an array of paths and/or package names.
	 */
	plugins: string[];

	/**
	 * Enable or disable DEBUG mode (progress logging and extra warnings).
	 * @default false
	 */
	devMode: "true" | "false"| boolean;

	/**
	 * Level of logging.
	 */
	logLevel: keyof typeof LogLevel,
}

export type OptionalConfigReflectionSection = Partial<Omit<ConfigReflectionSection, "metadata">> & { metadata?: Partial<ConfigReflectionSection["metadata"]> };