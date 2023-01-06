import type { Context }             from "../contexts/Context";
import type { CallsiteReference }   from "../declarations/callsites";
import { ClassTypeReference }       from "../declarations/ClassTypeReference";
import { ContextTypeReference }     from "../declarations/ContextTypeReference";
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
				// TODO: Make while traversing over "parent"s; we can have class inside class inside function etc..
				if (context.node && (/*ts.isFunctionLike(context.node) || */ts.isClassLike(context.node)))
				{
					if (context.node.typeParameters?.some(tp => context.typeChecker.getTypeAtLocation(tp) === type))
					{
						// if (ts.isFunctionLike(context.node)) {
						return new ClassTypeReference(type.symbol.escapedName + "");
						// }
					}
				}

				return type.symbol !== undefined
					? new ContextTypeReference(type.symbol.escapedName + "")
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
}