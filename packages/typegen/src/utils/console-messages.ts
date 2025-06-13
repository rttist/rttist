import { blue, dim, green, whiteBright } from "chalk";
import type { Config } from "../lib/config/config";
import { LogLevel, type Logger } from "../lib/logging";

export function printInitialMessage(logger: Logger, config: Config) {
	logger.log(
		LogLevel.Info,
		undefined,
		"Configuration",
		`\n\t${whiteBright("project root:".padEnd(20, " ") /*, LogColor.bright*/)} ${blue(config.projectRoot)}`,
		// `\n\t${whiteBright("TypeScript rootDir:".padEnd(20, " "))} ${config.tsRootDir}`, // tsRootDir requires typescript; but we don't want to import it early
		`\n\t${whiteBright("cache directory:".padEnd(20, " "))} ${blue(config.cacheDir)}`
	);
	logger.buffer.log("");
}

export function printNoChangesDetected(logger: Logger) {
	logger.buffer.log(
		`${green("\u2713 No changes detected.")}\n\t${dim("Use '-f' or '--force' to force generation.")}`
	);
}
