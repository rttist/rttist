import { TypeKind } from "rttist";
import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { InvalidTypeProperties } from "../../consts";
import { Context } from "../../contexts/context";
import { printTypeDebugInfo } from "../../tracers/printTypeDebugInfo";
import { getDeclaration } from "../../utils/symbolHelpers";

export function mapTypeParameter(type: ts.Type, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult {
	// return undefined;

	const declaration = getDeclaration(type.symbol);

	if (declaration) {
		if (ts.isTypeParameterDeclaration(declaration)) {
			return {
				kind: TypeKind.TypeParameter,
				name: declaration.name.escapedText as string,
				constraint:
					(declaration.constraint &&
						context.metadata.generateMetadataForType(
							context.transformerContext.syntaxTypeChecker.getType(declaration.constraint, false),
							context.typeChecker.getTypeAtLocation(declaration.constraint),
							false,
							undefined,
							undefined,
							context
						).typeReference) ||
					undefined,
				default:
					(declaration.default &&
						context.metadata.generateMetadataForType(
							context.transformerContext.syntaxTypeChecker.getType(declaration.default, false),
							context.typeChecker.getTypeAtLocation(declaration.default),
							false,
							undefined,
							undefined,
							context
						).typeReference) ||
					undefined,
			};
		}
	}

	context.log.warn("Unhandled TypeParameter.\n\t" + printTypeDebugInfo(type, context.typeChecker));
	return { ...InvalidTypeProperties };
}
