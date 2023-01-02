import type { Context }             from "../contexts/Context";
import type { CallsiteReference }   from "../declarations/callsites";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import * as ts                      from "typescript";

export function directTypeCallsiteReferenceFactory(
	typeArgTypes: Array<undefined | [ts.Type, ts.Symbol | undefined]>,
	context: Context
): CallsiteReference
{
	return typeArgTypes.map(
		entry => {
			if (entry === undefined)
			{
				return null;
			}

			const [type, symbol] = entry;

			if ((type.flags & ts.TypeFlags.TypeParameter) !== 0)
			{
				return symbol !== undefined
					? symbol.escapedName!
					: type.symbol !== undefined
						? type.symbol.escapedName!
						: TransformerTypeReference.Unknown;
			}

			return context.metadata.referenceType(
				type,
				symbol,
				undefined,
				context
			);
		}
	);

	// const obj: { [index: number]: TransformerTypeReference } = {};
	// for (const entry of typeArgTypes.entries())
	// {
	// 	const [type, symbol] = entry;
	// 	if ((type.flags & ts.TypeFlags.TypeParameter) !== 0)
	// 	{
	//
	// 	}
	// 	else
	// 	{
	// 		obj[index] = context.metadata.referenceType(
	// 			type,
	// 			symbol,
	// 			undefined,
	// 			context
	// 		);
	// 	}
	// }
	//
	// return obj;
}