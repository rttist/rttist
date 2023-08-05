import { createClient } from "memory-mapped-files";
import type { Client } from "memory-mapped-files";
import * as ts from "typescript";
import * as fs from "fs";
import { Config } from "../config/config";
import { TransformerContext } from "../transformer/contexts/transformer-context";
import { createSourceFileVisitor } from "../transformer/visitors/sourcefile-visitor";

export function generateModulesMetadata(
	sourceFiles: string[],
	config: Config,
	writeFileCallback: (filename: string) => void
) {
	// const mmfClient = undefined;
	const mmfClient = createClient();
	const options = getCompilerOptions(config);
	const host = createCompilerHost(options, config, mmfClient);
	const program = ts.createProgram(sourceFiles, options, host);
	const transformerContext = new TransformerContext(program, config, writeFileCallback);

	program.emit(undefined, undefined, undefined, false, {
		before: [
			(context) => {
				transformerContext.scopeManager.setTransformationContext(context);
				return createSourceFileVisitor(context, transformerContext);
			},
		],
	});

	// mmfClient.dispose();
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

			return fs.readFileSync(fileName, "utf-8");
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
	};
	return options;
}
