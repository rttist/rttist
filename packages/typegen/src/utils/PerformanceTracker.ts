import { blue, dim } from "chalk";
import type { Config } from "../lib/config/config";
import { type Logger, LogLevel } from "../lib/logging";
import { startTime } from "../lib/utils/performance-import-time-start";

const formatter = new Intl.NumberFormat();

export function formatPerformanceResult(start: number, end: number): string {
	const duration = end - start;

	if (duration < 0) {
		return `N/A ${dim("sec.")}`;
	}

	return `${blue(formatter.format(Math.round(duration * 100) / 100000))} ${dim("sec.")}`;
}

export class PerformanceTracker {
	private readonly performanceEntries: {
		parseStart: number;
		start: number;
		initialization?: number;
		metadataGenerationFinished?: number;
		completed?: number;
	} = {
		parseStart: startTime,
		start: performance.now(),
	};

	init() {
		this.performanceEntries.initialization = performance.now();
	}

	metadataGenerated() {
		this.performanceEntries.metadataGenerationFinished = performance.now();
	}

	finish() {
		this.performanceEntries.completed = performance.now();
	}

	printPerformanceInfo(logger: Logger, config: Config) {
		if (config.logLevel === LogLevel.None) {
			return;
		}

		logger.buffer.log("");
		logger.log(
			config.devMode ? LogLevel.Dev : LogLevel.Debug,
			undefined,
			`\n\t${dim("Importing modules: ")} ${formatPerformanceResult(this.performanceEntries.parseStart, this.performanceEntries.start)}`,

			`\n\t${dim("Initialization: ")} ${formatPerformanceResult(this.performanceEntries.start, this.performanceEntries.initialization ?? performance.now())}`,

			...(this.performanceEntries.metadataGenerationFinished === undefined ||
			this.performanceEntries.initialization === undefined
				? []
				: [
						`\n\t${dim("Generating metadata: ")} ${formatPerformanceResult(this.performanceEntries.initialization, this.performanceEntries.metadataGenerationFinished)}`,
					]),

			...(this.performanceEntries.completed === undefined ||
			this.performanceEntries.metadataGenerationFinished === undefined
				? []
				: [
						`\n\t${dim("Bundling typelib: ")} ${formatPerformanceResult(this.performanceEntries.metadataGenerationFinished, this.performanceEntries.completed)}`,
					]),

			...(this.performanceEntries.completed === undefined || this.performanceEntries.initialization === undefined
				? []
				: [
						`\n\tTotal time: ${formatPerformanceResult(this.performanceEntries.parseStart, this.performanceEntries.completed)}`,
					]),
			"\n"

			// "\n\tProcessed",
			// this.metadata.getNumberOfTypes(),
			// "type(s) from",
			// this.metadata.getNumberOfModules(),
			// "module(s)."
		);
	}
}
