import * as ts from "typescript";
import { TypeMapperResult } from "../../../../declarations/mappers";
import { Context } from "../../contexts/context";

export function mapTypeParameter(type: ts.Type, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult {
	return undefined;

	// const declaration = getDeclaration(type.symbol);
	//
	// if (declaration) {
	// 	if (ts.isTypeParameterDeclaration(declaration)) {
	// 		return {
	// 			kind: TypeKind.TypeParameter,
	// 			name: declaration.name.escapedText as string,
	// 			constraint:
	// 				(declaration.constraint &&
	// 					context.metadata.referenceType(
	// 						context.typeChecker.getTypeAtLocation(declaration.constraint),
	// 						false,
	// 						undefined,
	// 						undefined,
	// 						context
	// 					)) ||
	// 				undefined,
	// 			default:
	// 				(declaration.default &&
	// 					context.metadata.referenceType(
	// 						context.typeChecker.getTypeAtLocation(declaration.default),
	// 						false,
	// 						undefined,
	// 						undefined,
	// 						context
	// 					)) ||
	// 				undefined,
	// 		};
	// 	}
	// }
	//
	// log.warn("Unhandled TypeParameter.\n\t" + printTypeDebugInfo(type, context.typeChecker));
	// return { ...InvalidTypeProperties };
}
