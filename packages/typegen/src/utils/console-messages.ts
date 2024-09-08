import { blue, dim, green, whiteBright } from "chalk";
import { Config } from "../lib/config/config";
import { LogLevel, Logger } from "../lib/logging";

export function printInitialMessage(logger: Logger, config: Config) {
	logger.log(
		LogLevel.Info,
		undefined,
		"Configuration",
		`\n\t${whiteBright("project root:".padEnd(18, " ") /*, LogColor.bright*/)} ${blue(config.projectRoot)}`,
		// "\n\ttypescript root directory: " + config.tsRootDir, // tsRootDir required typescript; but we don't want to import it early
		`\n\t${whiteBright("cache directory:".padEnd(18, " "))} ${blue(config.cacheDir)}`
	);
	logger.buffer.log("");
}

export function printNoChangesDetected(logger: Logger) {
	logger.buffer.log(
		`${green("\u2713 No changes detected.")}\n\t${dim("Use '-f' or '--force' to force generation.")}`
	);
}
