import { TypeKind }         from "rttist";
import * as ts              from "typescript";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { EnumProperties }   from "../../declarations/TypeProperties";

export function mapEnum(type: ts.EnumType & { types?: ts.LiteralType[] }, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	symbol ??= type.symbol;

	// TODO: const enums. https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
	if ((symbol.flags & ts.SymbolFlags.ConstEnum) !== 0)
	{
		return {
			kind: TypeKind.Enum,
			name: type.symbol.escapedName.toString(),
			const: true,
			entries: {}
		} as EnumProperties;
	}

	// TODO: Computed enums does not have .types property. Exports can be used, but values must be evaluated somehow.
	// const exports = (Array.from((symbol.exports?.values() || []) as any) as ts.Symbol[]);
	
	return {
		kind: TypeKind.Enum,
		name: type.symbol.escapedName.toString(),
		const: false,
		entries: type.types?.reduce((result, item) => {
			result[item.symbol.escapedName.toString()] = (item as any).value
				//?? (context.typeChecker.getDeclaredTypeOfSymbol(item.symbol) as any).value
				?? undefined;
			return result;
		}, {} as Record<string, any>) || {}
	} as EnumProperties;
}