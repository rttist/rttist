import type * as ts from "typescript";
import type { CachedStorage } from "./cache/cached-storage";
import type { Config } from "./config/config";
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
import { resolveMetadataCachePath, resolveSourceFileCachePath } from "./utils/resolve-sourcefile-cache-path";
import * as fs from "node:fs/promises";
import * as $fs from "node:fs";
import { lazyTypescript } from "./utils/lazy-typescript";
import "./debugger";
import { CreateSourceFileOptions, ScriptTarget } from "typescript";
import type { TypescriptProgramProvider } from "../typescript-program-provider";

export type EventName = "write";
export type WriteEventHandler = (metadata: MetadataGeneratorResult) => void;
export type EventHandlers = {
	write: WriteEventHandler;
};

/**
 * Metadata of a single TS module
 */
export type MetadataGeneratorResult = {
	/**
	 * Generated metadata
	 */
	metadata: ModuleMetadata;

	/**
	 * Printed TypeScript code of the metadata file
	 */
	metadataSourceFile: string;

	/**
	 * Path of the source TS file
	 */
	fileName: string;
};

export class MetadataGenerator implements AsyncDisposable {
	private readonly eventHandlers = new Map<EventName, WriteEventHandler[]>([["write", []]]);
	private readonly logger = new Logger("MetadataGenerator", undefined, LogBuffer.default);
	private readonly metadataPrinter: MetadataPrinter;
	private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator;

	constructor(
		private readonly config: Config,
		private readonly typescriptProgramProvider: TypescriptProgramProvider,
		private readonly sourceFilesCachedStorage: CachedStorage,
		private readonly metadataCachedStorage: CachedStorage
	) {
		this.metadataPrinter = new MetadataPrinter(config);
		this.moduleIdentifierGenerator = new ModuleIdentifierGenerator(config);
	}

	async [Symbol.asyncDispose](): Promise<void> {}

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

	async generate(fileNames: string[], useCache = true): Promise<Record<string, MetadataGeneratorResult>> {
		const scopeRegistry = new ScopeRegistry();
		const scopeAnalyzer = new ScopeAnalyzer(this.config, scopeRegistry, this.moduleIdentifierGenerator);

		// TODO: Try to use TS Incremental Program
		const program = this.typescriptProgramProvider.getProgram(fileNames, this.sourceFilesCachedStorage);

		const transformerContext = new TransformerContext(
			program,
			this.config,
			scopeAnalyzer,
			scopeRegistry,
			this.moduleIdentifierGenerator
		);

		const writePromises: Promise<void>[] = [];
		const transformationContext: ts.TransformationContext = null as any;
		const sourceFilesSet = new Set(fileNames.map(normalizePath));
		const results: Record<string, MetadataGeneratorResult> = {};

		const projectRootWithTrailingSlash = `${normalizePath(this.config.projectRoot)}/`;

		for (const sourceFileNode of program.getSourceFiles()) {
			// TS sometimes set `fileName` to absolute path, so we need to normalize it.
			if (!sourceFilesSet.has(sourceFileNode.fileName.replace(projectRootWithTrailingSlash, ""))) {
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

			const printedSourceFile = this.metadataPrinter.printMetadata(moduleMetadata);

			// Add to results
			const result = {
				fileName: sourceFileNode.fileName,
				metadata: moduleMetadata,
				metadataSourceFile: printedSourceFile,
			};
			results[sourceFileNode.fileName] = result;

			if (useCache) {
				writePromises.push(this.persistModuleMetadata(result));
			}

			if (this.config.devMode) {
				this.logger.log(
					LogLevel.Trace,
					LogColor.gray,
					`Visitation of file ${sourceFileNode.fileName} has been finished.`
				);
			}
		}

		// Wait for persistence of all the files
		await Promise.all(writePromises);

		return results;
	}

	private async persistModuleMetadata(metadata: MetadataGeneratorResult): Promise<void> {
		const metadataSourceFilePath = resolveSourceFileCachePath(metadata.fileName, this.config);
		const metadataPath = resolveMetadataCachePath(metadata.fileName, this.config);

		try {
			await this.metadataCachedStorage.write(metadataSourceFilePath, metadata.metadataSourceFile);
			await this.metadataCachedStorage.write(metadataPath, JSON.stringify(metadata.metadata));
		} catch (e) {
			console.error(e);
		} finally {
			// TODO: Remove write event and use CachedStorage events instead.
			this.invokeEventHandlers("write", metadata);
			// writeFileCallback(sourceFileNode.fileName);
		}
	}

	private invokeEventHandlers<TEventName extends EventName>(
		eventName: TEventName,
		...args: Parameters<EventHandlers[TEventName]>
	) {
		const handlers = this.eventHandlers.get(eventName);

		if (handlers === undefined) {
			return;
		}

		for (const handler of handlers) {
			handler.apply(undefined, args as any);
		}
	}
}
