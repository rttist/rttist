import * as ts                  from "typescript";
import { Context }              from "../contexts/Context";
import { MemberNameProperties } from "../declarations/TypeProperties";
import { getUniqueSymbolInfo }  from "./getUniqueSymbolInfo";

export function getMemberName(member: ts.Symbol, context: Context): MemberNameProperties
{
	if (((member as any).nameType?.flags & ts.TypeFlags.UniqueESSymbol) !== 0)
	{
		return getUniqueSymbolInfo((member as any).nameType, context);
	}

	return member.escapedName.toString();
}