import type * as ts from "typescript";
import { Config } from "./config/config";
import { LogColor, Logger, LogLevel } from "./logging";
import { LogBuffer } from "./logging/log-buffer";
import { MetadataPrinter } from "./metadata/metadata-printer";
import { ScopeRegistry } from "./transformer/syntax-type-checker/scopes/scope-registry";
import { ModuleIdentifierGenerator } from "./transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { ScopeAnalyzer } from "./transformer/syntax-type-checker/scope-analyzer";
import { TransformerContext } from "./transformer/contexts/transformer-context";
import { dirname, normalizePath } from "./utils/path";
import { ModuleMetadata } from "./metadata/module-metadata";
import { Context } from "./transformer/contexts/context";
import { SourceFileContext } from "./transformer/contexts/source-file-context";
import { mainVisitor } from "./transformer/visitors/main-visitor";
import { resolveSourceFileCachePath } from "./utils/resolve-sourcefile-cache-path";
import * as fs from "fs/promises";
import * as $fs from "fs";
import { Client } from "memory-mapped-files";
import { lazyTypescript } from "./utils/lazy-typescript";
import "./debugger";

let createClient: undefined | typeof import("memory-mapped-files").createClient;
try {
	// createClient = require("memory-mapped-files").createClient;
	// import { createClient as cc } from "memory-mapped-files";
	// createClient = cc;
	// // createClient = (await import("memory-mapped-files")).createClient;
} catch (e) {}

export type EventName = "write";

export type WriteEventHandler = (sourceFilePath: string, metadataPath: string) => void;

export class MetadataGenerator {
	private readonly eventHandlers = new Map<EventName, WriteEventHandler[]>([["write", []]]);
	private readonly logger = new Logger("MetadataGenerator", undefined, LogBuffer.default);
	private readonly metadataPrinter: MetadataPrinter;
	// private readonly scopeRegistry: ScopeRegistry;
	private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator;
	// private readonly scopeAnalyzer: ScopeAnalyzer;
	private readonly mmfClient?: Client;
	private readonly tsCompilerOptions: ts.CompilerOptions;
	private readonly tsCompilerHost: ts.CompilerHost;

	constructor(private readonly config: Config) {
		this.metadataPrinter = new MetadataPrinter(config);
		this.moduleIdentifierGenerator = new ModuleIdentifierGenerator(config);

		this.mmfClient = createClient?.();
		this.tsCompilerOptions = this.getCompilerOptions(this.config);
		this.tsCompilerHost = this.createCompilerHost(this.tsCompilerOptions, this.config, this.mmfClient);
	}

	dispose() {
		this.mmfClient?.dispose();
	}

	on<TEventName extends EventName>(
		eventName: TEventName,
		handler: TEventName extends "write" ? WriteEventHandler : never
	) {
		let handlers = this.eventHandlers.get(eventName);

		if (!handlers) {
			handlers = [];
			this.eventHandlers.set(eventName, handlers);
		}

		handlers.push(handler);
	}

	async generate(sourceFiles: string[]): Promise<void> {
		const scopeRegistry = new ScopeRegistry();
		const scopeAnalyzer = new ScopeAnalyzer(this.config, scopeRegistry, this.moduleIdentifierGenerator);
		const program = lazyTypescript.get().createProgram(sourceFiles, this.tsCompilerOptions, this.tsCompilerHost);
		const transformerContext = new TransformerContext(
			program,
			this.config,
			scopeAnalyzer,
			scopeRegistry,
			this.moduleIdentifierGenerator
		);

		const writePromises: Promise<void>[] = [];
		const transformationContext: ts.TransformationContext = null as any;
		const sourceFilesSet = new Set(sourceFiles.map(normalizePath));

		for (let sourceFileNode of program.getSourceFiles()) {
			if (!sourceFilesSet.has(sourceFileNode.fileName)) {
				continue;
			}
			// // Skip if it is external SourceFile or if file is not included by config.
			// if (
			// 	program.isSourceFileFromExternalLibrary(sourceFileNode) ||
			// 	!canIncludeSourceFile(sourceFileNode.fileName, config)
			// ) {
			// 	return sourceFileNode;
			// }

			if (this.config.devMode) {
				this.logger.log(
					LogLevel.Trace,
					LogColor.cyan,
					`Visitation of file ${sourceFileNode.fileName} started.`
				);
			}

			// const sourceFileStart = performance.now();

			const moduleScope = scopeAnalyzer.analyzeSourceFile(sourceFileNode, transformationContext);
			const moduleMetadata = ModuleMetadata.createFromSourceFile(sourceFileNode, this.config, moduleScope);

			const context = new Context(
				undefined,
				transformerContext,
				transformationContext,
				new SourceFileContext(sourceFileNode, this.config, moduleScope, moduleMetadata),
				sourceFileNode,
				mainVisitor
			);

			// Visit SourceFile using the main visitor.
			mainVisitor(sourceFileNode, context);

			// this.perfEntries.sourceFiles.push(performance.now() - sourceFileStart);

			writePromises.push(
				this.persistModuleMetadata(sourceFileNode, this.config, this.metadataPrinter, moduleMetadata)
			);

			if (this.config.devMode) {
				this.logger.log(
					LogLevel.Trace,
					LogColor.gray,
					`Visitation of file ${sourceFileNode.fileName} has been finished.`
				);
			}
		}

		await Promise.all(writePromises);
	}

	private async persistModuleMetadata(
		sourceFileNode: ts.SourceFile,
		config: Config,
		metadataPrinter: MetadataPrinter,
		moduleMetadata: ModuleMetadata
	): Promise<void> {
		const filePath = resolveSourceFileCachePath(sourceFileNode.fileName, config);
		const fileMetadataDirname = dirname(filePath);

		try {
			return await fs.writeFile(filePath, metadataPrinter.printMetadata(moduleMetadata), "utf8");
		} catch (e) {
			$fs.mkdirSync(fileMetadataDirname, { recursive: true });
			return fs.writeFile(filePath, metadataPrinter.printMetadata(moduleMetadata), "utf8");
		} finally {
			this.invokeEventHandlers("write", sourceFileNode.fileName, filePath);
			// writeFileCallback(sourceFileNode.fileName);
		}
	}

	private createCompilerHost(options: ts.CompilerOptions, config: Config, mmfClient?: Client) {
		const host = lazyTypescript.get().createCompilerHost(options);

		host.writeFile = (fileName: string, contents: string) => {
			// writeFileCallback(fileName);
		};

		if (mmfClient) {
			host.readFile = (fileName) => {
				const file = mmfClient.getFile(fileName.replace(config.tsRootDir, ""));

				if (file) {
					return file;
				}

				return $fs.readFileSync(fileName, "utf-8");
			};
		}

		return host;
	}

	private getCompilerOptions(config: Config) {
		const options: ts.CompilerOptions = {
			...config.compilerOptions,
			// isolatedModules: true,
			// noLib: true,
			// skipDefaultLibCheck: true,
			// noResolve: true,
			// skipDefaultLibCheck: config.typecheck,
			noResolve: !config.typecheck,
			// noResolve: true,
			declaration: false,
			declarationMap: false,
			sourceMap: false,
			allowJs: true,
		};
		return options;
	}

	private invokeEventHandlers(eventName: EventName, ...args: any[]) {
		const handlers = this.eventHandlers.get(eventName);

		if (handlers === undefined) {
			return;
		}

		for (let handler of handlers) {
			handler.apply(undefined, args as any);
		}
	}
}
