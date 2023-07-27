import * as ts from "typescript";
import { Config } from "../config/config";
import { TransformerContext } from "../transformer/contexts/transformer-context";
import { createSourceFileVisitor } from "../transformer/visitors/sourcefile-visitor";

export function generateModulesMetadata(
	sourceFiles: string[],
	config: Config,
	writeFileCallback: (filename: string) => void
) {
	const options = getCompilerOptions(config);
	const host = createCompilerHost(options);
	const program = ts.createProgram(sourceFiles, options, host);

	const transformerContext = new TransformerContext(program, config, writeFileCallback);

	program.emit(undefined, undefined, undefined, false, {
		before: [
			(context) => {
				return createSourceFileVisitor(context, transformerContext);
			},
		],
	});
}

function createCompilerHost(options: ts.CompilerOptions /*, writeFileCallback: (filename: string) => void*/) {
	const host = ts.createCompilerHost(options);

	host.writeFile = (fileName: string, contents: string) => {
		// writeFileCallback(fileName);
	};

	return host;
}

function getCompilerOptions(config: Config) {
	const options: ts.CompilerOptions = {
		...config.compilerOptions,
		isolatedModules: true,
		// noLib: true,
		noResolve: true,
		declaration: false,
		declarationMap: false,
		sourceMap: false,
	};
	return options;
}
