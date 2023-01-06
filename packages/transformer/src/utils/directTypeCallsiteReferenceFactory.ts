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
				let ctx: Context | undefined = context;

				while (ctx !== undefined)
				{
					if (ctx.node !== undefined && ts.isClassLike(ctx.node)
						&& ctx.node.typeParameters?.some(tp => context.typeChecker.getTypeAtLocation(tp) === type))
					{
						return new ClassTypeReference(type.symbol.escapedName + "");
					}

					ctx = ctx.parent;
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