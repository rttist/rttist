import $path from "node:path";
import { type AnyTypeMetadata, Module } from "rttist";
import type * as ts from "typescript";
import type { NonNativeOnlyTypeProperties } from "../declarations/type-properties";
import type { CachedStorage } from "./cache/cached-storage";
import type { Config } from "./config/config";
import { LogColor, Logger, LogLevel, LogBuffer } from "./logging";
import { MetadataPrinter } from "./metadata/metadata-printer";
import { ScopeRegistry } from "./transformer/syntax-type-checker/scopes/scope-registry";
import { ModuleIdentifierGenerator } from "./transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { ScopeAnalyzer } from "./transformer/syntax-type-checker/scope-analyzer";
import { TransformerContext } from "./transformer/contexts/transformer-context";
import { isExpression } from "./transformer/utils/to-expression";
import { toNormalizedProjectPath } from "./utils/path";
import { ModuleMetadata } from "./metadata/module-metadata";
import type { ModuleMetadata as RuntimeModuleMetadata } from "rttist";
import { Context } from "./transformer/contexts/context";
import { SourceFileContext } from "./transformer/contexts/source-file-context";
import { mainVisitor } from "./transformer/visitors/main-visitor";
import { resolveMetadataCachePath, resolveSourceFileCachePath } from "./utils/resolve-sourcefile-cache-path";
import "./debugger";
import type { TypescriptProgramProvider } from "../typescript-program-provider";

export type EventName = "write";
export type WriteEventHandler = (metadata: ModuleMetadataGeneratorResult) => void;
export type EventHandlers = {
	write: WriteEventHandler;
};

/**
 * Metadata of a single TS module
 */
export type ModuleMetadataGeneratorResult = {
	/**
	 * Raw serializable metadata of the module.
	 */
	metadata: RuntimeModuleMetadata;

	/**
	 * Module object equal to the Module from RTTIST runtime
	 */
	get module(): Module;

	/**
	 * Printed TypeScript code of the metadata file
	 */
	metadataSourceFile: string;

	/**
	 * Path for the `metadataSourceFile`
	 */
	metadataSourceFilePath: string;

	/**
	 * Normalized path of the source TS file
	 */
	sourceFilePath: string;
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

	/**
	 * Generates metadata for the given TypeScript files.
	 * @param sourceFilePaths List of project normalized paths (absolute paths with forward slashes) to the source files.
	 */
	async generate(sourceFilePaths: string[]): Promise<Record<string, ModuleMetadataGeneratorResult>> {
		const scopeRegistry = new ScopeRegistry();
		const scopeAnalyzer = new ScopeAnalyzer(this.config, scopeRegistry, this.moduleIdentifierGenerator);

		// TODO: Try to use TS Incremental Program
		const program = this.typescriptProgramProvider.getProgram(sourceFilePaths, this.sourceFilesCachedStorage);

		const transformerContext = new TransformerContext(
			program,
			this.config,
			scopeAnalyzer,
			scopeRegistry,
			this.moduleIdentifierGenerator
		);

		const writePromises: Promise<void>[] = [];
		const transformationContext: ts.TransformationContext = null as any;
		const sourceFilesSet = new Set(sourceFilePaths);
		const results: Record<string, ModuleMetadataGeneratorResult> = {};

		for (const sourceFileNode of program.getSourceFiles()) {
			const normalizedFilename = toNormalizedProjectPath(sourceFileNode.fileName, this.config);

			// TS sometimes set `fileName` to absolute path, so we need to normalize it.
			if (!sourceFilesSet.has(normalizedFilename)) {
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
			const config = this.config;
			let module: Module | undefined;
			let metadata: RuntimeModuleMetadata | undefined;

			// Add to results
			const result: ModuleMetadataGeneratorResult = {
				sourceFilePath: normalizedFilename,
				get metadata() {
					if (metadata === undefined) {
						const { id, name, children, types } = moduleMetadata.getModuleProperties(config);
						metadata = {
							id,
							name,
							path: normalizedFilename,
							children,
							import: () => import($path.normalize(normalizedFilename)),
							// TODO: Validate this; this may be incorrect
							types: types?.map((t) => {
								const props: Record<string, any> = {};
								for (const [key, value] of Object.entries(t)) {
									if (value && isExpression(value)) {
										continue;
									}
									props[key] = value;
								}
								return props as AnyTypeMetadata;
							}) as NonNativeOnlyTypeProperties[] as AnyTypeMetadata[],
						};
					}

					return metadata;
				},
				get module() {
					if (module === undefined) {
						module = new Module(this.metadata);
					}

					return module;
				},
				metadataSourceFile: printedSourceFile,
				metadataSourceFilePath: resolveSourceFileCachePath(sourceFileNode.fileName, this.config),
			};
			results[sourceFileNode.fileName] = result;

			writePromises.push(this.persistModuleMetadata(result));

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

	private async persistModuleMetadata(metadata: ModuleMetadataGeneratorResult): Promise<void> {
		const metadataPath = resolveMetadataCachePath(metadata.sourceFilePath, this.config);

		try {
			await this.metadataCachedStorage.write(metadata.metadataSourceFilePath, metadata.metadataSourceFile);
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
