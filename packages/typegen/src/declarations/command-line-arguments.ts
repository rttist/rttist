export type CommandLineArguments = {
	projectRoot: string;
	// config: string;

	/**
	 * Watch for changes after generation.
	 */
	watch: boolean;

	/**
	 * Force generation of all files.
	 */
	force: boolean;
};
