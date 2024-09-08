import { blue, dim } from "chalk";
import { Config } from "../lib/config/config";
import { Logger, LogLevel } from "../lib/logging";
import { startTime } from "../lib/utils/performance-import-time-start";

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
			`\n\t${dim("Importing modules: ")} ${blue(
				roundPerfTime(this.performanceEntries.start - this.performanceEntries.parseStart).toString()
			)} ${dim("sec.")}`,

			`\n\t${dim("Initialization: ")} ${blue(
				roundPerfTime(
					(this.performanceEntries.initialization ?? performance.now()) - this.performanceEntries.start
				).toString()
			)} ${dim("sec.")}`,

			...(this.performanceEntries.metadataGenerationFinished === undefined ||
			this.performanceEntries.initialization === undefined
				? []
				: [
						`\n\t${dim("Generating metadata: ")} ${blue(
							roundPerfTime(
								this.performanceEntries.metadataGenerationFinished -
									this.performanceEntries.initialization
							).toString()
						)} ${dim("sec.")}`,
				  ]),

			...(this.performanceEntries.completed === undefined ||
			this.performanceEntries.metadataGenerationFinished === undefined
				? []
				: [
						`\n\t${dim("Bundling typelib: ")} ${blue(
							roundPerfTime(
								this.performanceEntries.completed - this.performanceEntries.metadataGenerationFinished
							).toString()
						)} ${dim("sec.")}`,
				  ]),

			...(this.performanceEntries.completed === undefined || this.performanceEntries.initialization === undefined
				? []
				: [
						`\n\tTotal time: ${blue(
							roundPerfTime(
								this.performanceEntries.completed - this.performanceEntries.parseStart
							).toString()
						)} sec.`,
				  ]),
			"\n"

			// "\n\tProcessed",
			// this.metadata.getNumberOfTypes(),
			// "type(s) from",
			// this.metadata.getNumberOfModules(),
			// "module(s)."
		);

		function roundPerfTime(time: number): number | string {
			if (time < 0) {
				return "N/A";
			}

			return Math.round(time * 100) / 100000;
		}
	}
}
