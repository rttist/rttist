import * as ts                  from "typescript";
import { Context }              from "../contexts/Context";
import { MemberNameProperties } from "../declarations/TypeProperties";
import { getUniqueSymbolInfo }  from "../utils/getUniqueSymbolInfo";
import { getDeclaration }       from "../utils/symbolHelpers";

export function getMemberName(member: ts.Symbol, context: Context): MemberNameProperties
{
	const nameType: ts.Type | undefined = (member as any).nameType;

	if (nameType !== undefined && (nameType.flags & ts.TypeFlags.UniqueESSymbol) !== 0)
	{
		return getUniqueSymbolInfo((member as any).nameType, context);
	}

	if (nameType?.isLiteral())
	{
		return nameType.value as string | number;
	}

	const declaration = getDeclaration(member);

	if (declaration !== undefined
		&& (ts.isPropertyDeclaration(declaration) || ts.isPropertyAssignment(declaration))
		&& ts.isNumericLiteral(declaration.name))
	{
		return Number(member.escapedName);
	}

	return member.escapedName.toString();
}