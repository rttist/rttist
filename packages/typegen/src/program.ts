// Keep PerformanceTracker first because of start time.
import { PerformanceTracker } from "./utils/PerformanceTracker";
import { TypescriptCompilerHostFactory } from "./lib/typescript-compilerhost-factory";
import { projectFilesProvider } from "./project-files-provider";
import { TypescriptProgramProvider } from "./typescript-program-provider";
import { type Config, getParsedConfig } from "./lib/config/config";
import { CacheStats } from "./lib/cache/cache-stats";
import { Logger, LogLevel } from "./lib/logging";
import { LogBuffer } from "./lib/logging/log-buffer";
import { TypelibGenerator } from "./lib/typelib-generator";
import * as cliProgress from "cli-progress";
import { ModuleIdentifierGenerator } from "./lib/transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { blue, green } from "chalk";
import { printInitialMessage, printNoChangesDetected } from "./utils/console-messages";
import type { CommandLineArguments } from "./declarations/command-line-arguments";
import { MetadataGeneratorSpawner } from "./metadata-generator-spawner";

export class Program {
	private readonly logger = new Logger("Program", undefined, LogBuffer.autoFlush);
	private readonly performanceTracker = new PerformanceTracker();

	constructor(private readonly args: CommandLineArguments) {}

	private async getConfig(): Promise<Config> {
		return await getParsedConfig(this.args);
	}

	public async run(): Promise<void> {
		const config = await this.getConfig();

		Logger.setLevel(config.logLevel);
		printInitialMessage(this.logger, config);
		const stats = new CacheStats(config, this.logger);
		const allFiles = await projectFilesProvider.getSourceFilesWithStats(config);
		const changedFilesToRegenerate = projectFilesProvider.getFilesToRegenerate(allFiles, config, stats);
		const typelibGenerator = new TypelibGenerator(
			config,
			new ModuleIdentifierGenerator(config),
			allFiles.map((x) => x.path)
		);

		// Generate metadata and typelibs
		await this.generate(changedFilesToRegenerate, config, typelibGenerator, stats);

		// Watch files in case the watch mode is enabled.
		if (config.watch) {
			const { Watcher } = require("./lib/watcher");
			const watcher = new Watcher(config, typelibGenerator);
			watcher.watch();
		}
	}

	private async generate(
		changedFilesToRegenerate: string[],
		config: Config,
		typelibGenerator: TypelibGenerator,
		stats: CacheStats
	) {
		if (changedFilesToRegenerate.length === 0) {
			this.handleNoChangesDetected(config);
			return;
		}

		const performanceTracker = this.performanceTracker;
		const progressBar = this.createProgressBar(changedFilesToRegenerate);

		const compilerHostFactory = new TypescriptCompilerHostFactory(config);
		const typescriptProgramProvider = new TypescriptProgramProvider(config, compilerHostFactory);

		// SPAWN workers
		const generator = new MetadataGeneratorSpawner(config, this.logger, typescriptProgramProvider);

		await generator.generate(changedFilesToRegenerate, {
			afterSetup() {
				performanceTracker.init();
			},
			moduleMetadataGenerated() {
				progressBar.increment();
			},
		});

		progressBar.stop();
		this.logger.buffer.log("");
		this.performanceTracker.metadataGenerated();

		await typelibGenerator.generate();
		await typelibGenerator.bundle();
		this.performanceTracker.finish();

		this.logger.buffer.log("");
		this.logger.buffer.log(green("\u2713 Done"));

		this.performanceTracker.printPerformanceInfo(this.logger, config);

		stats.value.lastGeneration = new Date();
		stats.persist();
	}

	private handleNoChangesDetected(config: Config) {
		printNoChangesDetected(this.logger);
		this.performanceTracker.init();
		this.performanceTracker.printPerformanceInfo(this.logger, config);
	}

	private createProgressBar(files: string[]) {
		const progressBar = new cliProgress.SingleBar(
			{
				stream: process.stdout,
				clearOnComplete: false,
				format: `\t[{bar}] ${blue("{percentage}")} % | ${blue("{value}")}/${blue("{total}")}`,
			},
			cliProgress.Presets.legacy
		);
		this.logger.log(LogLevel.Always, undefined, "Processing files...");
		progressBar.start(files.length, 0);
		return progressBar;
	}
}
