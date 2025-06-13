import type * as ts from "typescript";
import { lazyTypescript } from "./lib/utils/lazy-typescript";
import type { Config } from "./lib/config/config";
import type { TypescriptCompilerHostFactory } from "./lib/typescript-compilerhost-factory";
import type { CachedStorage } from "./lib/cache/cached-storage";

export class TypescriptProgramProvider {
	constructor(
		private readonly config: Config,
		private readonly compilerHostFactory: TypescriptCompilerHostFactory
	) {}

	public getProgram(fileNames: string[], sourceFilesCachedStorage: CachedStorage): ts.Program {
		const tsCompilerOptions = this.getCompilerOptions(this.config);
		const tsCompilerHost = this.compilerHostFactory.createCompilerHost(tsCompilerOptions, sourceFilesCachedStorage);

		// TODO: Change to incremental; maybe wait for the native TypeScript 7
		const program: ts.Program = lazyTypescript.get().createProgram(fileNames, tsCompilerOptions, tsCompilerHost);

		return program;
	}

	private getCompilerOptions(config: Config) {
		const options: ts.CompilerOptions = {
			...config.compilerOptions,
			// isolatedModules: true,
			// noLib: true,
			// skipDefaultLibCheck: true,
			// noResolve: true,
			// skipDefaultLibCheck: config.typecheck,
			// noResolve: !config.typecheck,
			// noResolve: true,
			declaration: false,
			declarationMap: false,
			sourceMap: false,
			target: lazyTypescript.get().ScriptTarget.ESNext,

			allowJs: true,
			// TODO: This is experiment; we have to test what that actually mean; will it prevent type inference of types from node_modules?
			skipLibCheck: true,
			noLib: true,
		};

		return options;
	}
}
