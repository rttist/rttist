import * as ts              from "typescript";
import { TypeKind }         from "rttist";
import { Context }          from "../../contexts/Context";
import { TypeMapperResult } from "../../declarations/mappers";
import { getSymbol }        from "../../utils/typeHelpers";
import { mapIndexes }       from "../mapIndexes";
import { mapMethods }       from "../mapMethods";
import { mapProperties }    from "../mapProperties";

export function mapObjectLiteral(type: ts.ObjectType, symbol: ts.Symbol | undefined, context: Context): TypeMapperResult
{
	symbol ??= getSymbol(type, context.typeChecker);
	const members = type.getProperties();

	return {
		kind: TypeKind.Object,
		name: symbol?.escapedName.toString() || "",
		properties: mapProperties(members, context),
		methods: mapMethods(members, context),
		indexes: mapIndexes(type, context),
	};
}