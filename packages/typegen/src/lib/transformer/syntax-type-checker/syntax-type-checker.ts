import * as ts from "typescript";
import { Logger } from "../../logging";
import { getNodeLocationText } from "../tracers/getNodeLocationText";
import { TypeIdentifierGenerator } from "./identifier-generators/type-identifier-generator";
import { TransformerType } from "./transformer-type";

// type ExtendedSourceFile = ts.SourceFile & {
// 	moduleScope?: ModuleScope;
// };

export class SyntaxTypeChecker {
	// private transformationContext?: ts.TransformationContext;

	constructor(
		// private readonly scopeAnalyzer: ScopeAnalyzer,
		// private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator,
		private readonly typeIdentifierGenerator: TypeIdentifierGenerator,
		private readonly logger: Logger // config: Config
	) {}

	// setTransformationContext(transformationContext: ts.TransformationContext) {
	// 	this.transformationContext = transformationContext;
	// }

	getType(node: ts.Node): TransformerType {
		const sourceFile: ts.SourceFile | undefined = node.getSourceFile();

		if (sourceFile === undefined) {
			this.logger.error("Could not find source file of node\n\t", getNodeLocationText(node));
			return TransformerType.Invalid;
		}

		// const moduleScope = this.getModuleScope(sourceFile);
		const typeIdentifier = this.typeIdentifierGenerator.generateTypeIdentifier(node);
		return typeIdentifier ? new TransformerType(typeIdentifier) : TransformerType.Invalid;
	}

	// private getModuleScope(sourceFile: ts.SourceFile) {
	// 	return (
	// 		(sourceFile as ExtendedSourceFile)?.moduleScope ??
	// 		((sourceFile as ExtendedSourceFile).moduleScope = this.scopeAnalyzer.analyzeSourceFile(sourceFile))
	// 	);
	// }
}
