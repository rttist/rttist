import * as ts from "typescript";
import { TransformerTypeReference } from "../../../metadata/transformer-type-reference";
import { TypeCheckerTypeIdentifierGenerator } from "../identifier-generators/type-checker-type-identifier-generator";

// type ExtendedSourceFile = ts.SourceFile & {
// 	moduleScope?: ModuleScope;
// };

export class TypeScriptTypeTypeChecker {
	constructor(private readonly typeCheckerTypeIdentifierGenerator: TypeCheckerTypeIdentifierGenerator) {}

	getType(
		type: ts.Type,
		symbol: ts.Symbol | undefined,
		nullable: boolean,
		anonymous: boolean = false
	): TransformerTypeReference {
		const typeIdentifier = this.typeCheckerTypeIdentifierGenerator.getTypeCheckerTypeIdentifier(
			type,
			symbol,
			nullable,
			anonymous
		);
		return typeIdentifier ? new TransformerTypeReference(typeIdentifier) : TransformerTypeReference.Invalid;
	}
}
