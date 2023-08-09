import * as ts from "typescript";
import { Config } from "../../config/config";
import { ModuleMetadata } from "../../metadata/module-metadata";
import { ModuleScope } from "../syntax-type-checker/scopes/module-scope";

export class SourceFileContext {
	constructor(
		public readonly sourceFile: ts.SourceFile,
		public readonly config: Config,
		public readonly scope: ModuleScope,
		public readonly metadata: ModuleMetadata
	) {}
}
