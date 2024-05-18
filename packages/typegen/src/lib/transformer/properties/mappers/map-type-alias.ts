import { TypeKind } from "rttist";
import * as ts from "typescript";
import { TypeAliasProperties } from "../../../../declarations/type-properties";
import { InvalidTypeProperties } from "../../consts";
import { Context } from "../../contexts/context";
import { getDeclaration } from "../../utils/symbolHelpers";

export function mapTypeAlias(type: ts.Type, symbol: ts.Symbol, context: Context) {
	const declaration = getDeclaration<ts.TypeAliasDeclaration>(symbol);

	if (declaration === undefined) {
		return { ...InvalidTypeProperties };
	}

	const targetType = context.typeChecker.getTypeAtLocation(declaration.type);

	// Alias of complex type - object
	if (declaration.type.kind === ts.SyntaxKind.TypeLiteral) {
		const targetTypeRef = context.transformerContext.tsTypeTypeChecker.getType(
			targetType,
			targetType.symbol,
			false,
			true
		);

		// Generate METADATA for the target type of the alias.
		context.metadata.generateMetadataForType(
			targetTypeRef,
			targetType,
			false,
			targetType.symbol,
			undefined,
			context
		);

		return {
			name: symbol.escapedName.toString(),
			kind: TypeKind.Alias,
			target: targetTypeRef,
		} as TypeAliasProperties;
	}

	const targetTypeRef = context.transformerContext.syntaxTypeChecker.getType(declaration.type);

	// Generate METADATA for the target type of the alias.
	context.metadata.generateMetadataForType(targetTypeRef, targetType, false, targetType.symbol, undefined, context);

	return {
		name: symbol.escapedName.toString(),
		kind: TypeKind.Alias,
		target: targetTypeRef,
	} as TypeAliasProperties;
}
