import type { Client } from "memory-mapped-files";
import * as ts from "typescript";
import * as fs from "fs/promises";
import * as $fs from "fs";
import { Config } from "../config/config";
import { TransformerContext } from "../transformer/contexts/transformer-context";
import { LogColor, Logger, LogLevel } from "../logging";
import { LogBuffer } from "../logging/log-buffer";
import { Context } from "../transformer/contexts/context";
import { SourceFileContext } from "../transformer/contexts/source-file-context";
import { mainVisitor } from "../transformer/visitors/main-visitor";
import { resolveSourceFileCachePath } from "../utils/resolve-sourcefile-cache-path";
import { dirname, normalizePath } from "../utils/path";
import { MetadataPrinter } from "../metadata/metadata-printer";
import { ScopeRegistry } from "../transformer/syntax-type-checker/scopes/scope-registry";
import { ModuleIdentifierGenerator } from "../transformer/syntax-type-checker/identifier-generators/module-identifier-generator";
import { ScopeAnalyzer } from "../transformer/syntax-type-checker/scope-analyzer";
import { ModuleMetadata } from "../metadata/module-metadata";

let createClient: undefined | typeof import("memory-mapped-files").createClient;
try {
	createClient = require("memory-mapped-files").createClient;
} catch (e) {}

export async function generateModulesMetadata(
	sourceFiles: string[],
	config: Config,
	writeFileCallback: (filename: string) => void
) {
	const mmfClient = createClient?.();
	const options = getCompilerOptions(config);
	const host = createCompilerHost(options, config, mmfClient);
	const logger = new Logger("Metadata generator", undefined, LogBuffer.default);
	const metadataPrinter = new MetadataPrinter(config);
	const scopeRegistry = new ScopeRegistry();
	const moduleIdentifierGenerator = new ModuleIdentifierGenerator(config);
	const scopeAnalyzer = new ScopeAnalyzer(config, scopeRegistry, moduleIdentifierGenerator);

	const program = ts.createProgram(sourceFiles, options, host);
	const transformerContext = new TransformerContext(
		program,
		config,
		scopeAnalyzer,
		scopeRegistry,
		moduleIdentifierGenerator
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

		if (config.devMode) {
			logger.log(LogLevel.Trace, LogColor.cyan, `Visitation of file ${sourceFileNode.fileName} started.`);
		}

		// const sourceFileStart = performance.now();

		const moduleScope = scopeAnalyzer.analyzeSourceFile(sourceFileNode, transformationContext);
		const moduleMetadata = ModuleMetadata.createFromSourceFile(sourceFileNode, config, moduleScope);

		const context = new Context(
			undefined,
			transformerContext,
			transformationContext,
			new SourceFileContext(sourceFileNode, config, moduleScope, moduleMetadata),
			sourceFileNode,
			mainVisitor
		);

		// Visit SourceFile using the main visitor.
		mainVisitor(sourceFileNode, context);

		// this.perfEntries.sourceFiles.push(performance.now() - sourceFileStart);

		writePromises.push(
			persistModuleMetadata(sourceFileNode, config, metadataPrinter, moduleMetadata, writeFileCallback)
		);

		if (config.devMode) {
			logger.log(
				LogLevel.Trace,
				LogColor.gray,
				`Visitation of file ${sourceFileNode.fileName} has been finished.`
			);
		}
	}

	await Promise.all(writePromises);
	mmfClient?.dispose();
}

function persistModuleMetadata(
	sourceFileNode: ts.SourceFile,
	config: Config,
	metadataPrinter: MetadataPrinter,
	moduleMetadata: ModuleMetadata,
	writeFileCallback: (filename: string) => void
): Promise<void> {
	const filePath = resolveSourceFileCachePath(sourceFileNode.fileName, config);
	const fileMetadataDirname = dirname(filePath);

	return fs
		.writeFile(filePath, metadataPrinter.printMetadata(moduleMetadata), "utf8")
		.catch((e) => {
			$fs.mkdirSync(fileMetadataDirname, { recursive: true });
			return fs.writeFile(filePath, metadataPrinter.printMetadata(moduleMetadata), "utf8");
		})
		.finally(() => {
			writeFileCallback(sourceFileNode.fileName);
		});
}

function createCompilerHost(options: ts.CompilerOptions, config: Config, mmfClient?: Client) {
	const host = ts.createCompilerHost(options);

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

function getCompilerOptions(config: Config) {
	const options: ts.CompilerOptions = {
		...config.compilerOptions,
		isolatedModules: true,
		// noLib: true,
		skipDefaultLibCheck: config.typecheck,
		noResolve: !config.typecheck,
		declaration: false,
		declarationMap: false,
		sourceMap: false,
		allowJs: true,
	};
	return options;
}
