import * as ts from "typescript";
import { workerData, parentPort } from "worker_threads";
import { WorkerArguments } from "./declarations/worker-arguments";
import { Logger } from "./logging";
import { TransformerContext } from "./transformer/contexts/transformer-context";
import { createSourceFileVisitor } from "./transformer/visitors/sourcefile-visitor";
import { resolvePath } from "./utils/path";
import { MessageType } from "./workers-messaging";
// import { Config }          from "./transformer/config/Config";
// import { TransformerContext } from "./transformer/contexts/TransformerContext";
// import {
// 	log,
// 	LogColor,
// 	Logger,
// 	LogLevel
// } from "./transformer/logging";
// import { DefaultPlugin }   from "./transformer/plugins";
// import { createSourceFileVisitor } from "./transformer/visitors/sourceFileVisitor";

const workerArguments = workerData as WorkerArguments;
const files = workerArguments.files.map((filePath) => resolvePath(workerArguments.config.projectRoot, filePath));

Logger.setGlobalPrefix("@rttist/typegen");
Logger.setLevel(workerArguments.config.logLevel);

// let program = ts.createProgram(
// 	workerArguments.fileNames,
//
// );
const options: ts.CompilerOptions = {
	...workerArguments.config.compilerOptions,
	isolatedModules: true,
	noLib: true,
	noResolve: true,
	declaration: false,
	declarationMap: false,
	sourceMap: false,

	// skipLibCheck: true,
	// skipDefaultLibCheck: true,
	// maxNodeModuleJsDepth: 0,
	// disableReferencedProjectLoad: true,
};
const host = ts.createCompilerHost(options);
host.writeFile = (fileName: string, contents: string) => {
	parentPort?.postMessage({
		type: MessageType.FileFinished,
	});
};

// Prepare and emit the d.ts files
const program = ts.createProgram(files, options, host);

// let checker = program.getTypeChecker();

const transformerContext = new TransformerContext(program, workerArguments.config);
// console.log(program.getSourceFiles().map((f) => f.fileName));

program.emit(undefined, undefined, undefined, false, {
	before: [
		(context) => {
			return createSourceFileVisitor(context, transformerContext);

			// return (sourceFile: ts.SourceFile) => {
			// 	console.log("Before sourceFile", sourceFile.fileName);
			// 	return sourceFile;
			// };
		},
	],
	// after: [
	//
	// ],
	// afterDeclarations: 	[
	//
	// ]
});

console.log("Worker finished...");

// // Create configuration object
// const config = new Config(program, {});
//
// // Add default plugin
// config.plugins.unshift(new DefaultPlugin());
//
// // Set logging level
// Logger.setLevel(config.logLevel);
//
// // Log detected project root
// log.log(LogLevel.Info, LogColor.blue, "Detected project root: " + config.projectDir);

// // Initiate TransformerContext
// const transformerContext = new TransformerContext(program, config);

// const visitor = createSourceFileVisitor(context, transformerContext);

// const sourceFiles = program.getSourceFiles();
//
// // const projectFilesSet = program.getRootFileNames().reduce(
// // 	(set, fileName) => {
// // 		set.add(fileName);
// // 		return set;
// // 	},
// // 	new Set<string>
// // );
// const projectFilesSet = new Set<string>(workerArguments.files);
//
// // console.log("Source files: ", sourceFiles.length);
//
// for (let sourceFile of sourceFiles) {
// 	if (projectFilesSet.has(sourceFile.fileName)) {
// 		// console.log("Worker processing file:", sourceFile.fileName);
//
// 		// ts.visitNode(sourceFile, node => {
// 		//
// 		//
// 		// 	return node;
// 		// });
//
// 		if (sourceFile.isDeclarationFile) {
// 		} else {
// 			// ts.create
// 		}
// 	}
// }

// const voidCallback = () => {};
// const emptyFunction = (...args: any[]) => {};

// function createTransformationContext() {
// 	const enabledSyntaxKindFeatures = new Array(362 /* Count */);
// 	let lexicalEnvironmentVariableDeclarations;
// 	let lexicalEnvironmentFunctionDeclarations;
// 	let lexicalEnvironmentStatements;
// 	let lexicalEnvironmentFlags = 0 /* None */;
// 	let lexicalEnvironmentVariableDeclarationsStack = [];
// 	let lexicalEnvironmentFunctionDeclarationsStack = [];
// 	let lexicalEnvironmentStatementsStack = [];
// 	let lexicalEnvironmentFlagsStack = [];
// 	let lexicalEnvironmentStackOffset = 0;
// 	let lexicalEnvironmentSuspended = false;
// 	let blockScopedVariableDeclarationsStack = [];
// 	let blockScopeStackOffset = 0;
// 	let blockScopedVariableDeclarations;
// 	let emitHelpers;
// 	let onSubstituteNode = voidCallback;
// 	let onEmitNode = voidCallback;
// 	let state = 0 /* Uninitialized */;
// 	const diagnostics = [];
//
// 	return {
// 		factory: factory2,
// 		getCompilerOptions: () => workerArguments.compilerOptions,
// 		getEmitResolver: () => resolver,
// 		// TODO: GH#18217
// 		getEmitHost: () => program.host,
// 		// TODO: GH#18217
// 		getEmitHelperFactory: emptyFunction,
// 		// getEmitHelperFactory: memoize(() => createEmitHelperFactory(context)),
// 		startLexicalEnvironment: emptyFunction,
// 		suspendLexicalEnvironment: emptyFunction,
// 		resumeLexicalEnvironment: emptyFunction,
// 		endLexicalEnvironment: emptyFunction,
// 		setLexicalEnvironmentFlags: emptyFunction,
// 		getLexicalEnvironmentFlags: emptyFunction,
// 		hoistVariableDeclaration: emptyFunction,
// 		hoistFunctionDeclaration: emptyFunction,
// 		addInitializationStatement: emptyFunction,
// 		startBlockScope: emptyFunction,
// 		endBlockScope: emptyFunction,
// 		addBlockScopedVariable: emptyFunction,
// 		requestEmitHelper: emptyFunction,
// 		readEmitHelpers: emptyFunction,
// 		enableSubstitution: emptyFunction,
// 		enableEmitNotification: emptyFunction,
// 		isSubstitutionEnabled: false,
// 		isEmitNotificationEnabled: false,
// 		get onSubstituteNode() {
// 			return onSubstituteNode;
// 		},
// 		set onSubstituteNode(value) {
// 			// Debug.assert(state < 1 /* Initialized */, "Cannot modify transformation hooks after initialization has completed.");
// 			// Debug.assert(value !== void 0, "Value must not be 'undefined'");
// 			onSubstituteNode = value;
// 		},
// 		get onEmitNode() {
// 			return onEmitNode;
// 		},
// 		set onEmitNode(value) {
// 			// Debug.assert(state < 1 /* Initialized */, "Cannot modify transformation hooks after initialization has completed.");
// 			// Debug.assert(value !== void 0, "Value must not be 'undefined'");
// 			onEmitNode = value;
// 		},
// 		addDiagnostic(diag2: any) {
// 			diagnostics.push(diag2);
// 		}
// 	};
// }
