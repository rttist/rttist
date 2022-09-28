import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";

export function mapConditional(type: ts.ConditionalType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	const ct = type.root.node;
	const extendsType = context.typeChecker.getTypeAtLocation(ct.extendsType);
	const trueType = context.typeChecker.getTypeAtLocation(ct.trueType);

	// return {
	// 		kind: TypeKind.ConditionalType,
	// 		condition: {
	// 			extends: getTypeCall(extendsType, extendsType.symbol, context),
	// 			trueType: getTypeCall(trueType, trueType.symbol, context),
	// 			falseType: getTypeCall(context.typeChecker.getTypeAtLocation(ct.falseType), context.typeChecker.getSymbolAtLocation(ct.falseType), context)
	// 		}
	// };

	return undefined;
}