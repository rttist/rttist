import type { Context }              from "../contexts/Context";
import type { CallsiteReference }    from "../declarations/callsites";
import { ClassContextTypeReference } from "../declarations/ClassContextTypeReference";
import { ClassTypeReference }        from "../declarations/ClassTypeReference";
import { ContextTypeReference }      from "../declarations/ContextTypeReference";
import { TransformerTypeReference }  from "../declarations/TransformerTypeReference";
import * as ts                       from "typescript";

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
				let crossContextCounter = 0;

				while (ctx !== undefined)
				{
					if (ctx.node !== undefined)
					{
						if (ts.isClassLike(ctx.node))
						{
							crossContextCounter++;
							
							if (ctx.node.typeParameters?.some(tp => context.typeChecker.getTypeAtLocation(tp) === type))
							{
								if (crossContextCounter <= 1)
								{
									return new ClassTypeReference(type.symbol.escapedName + "");
								}

								return new ClassContextTypeReference(
									ctx.node.name?.escapedText ?? "",
									type.symbol.escapedName + ""
								);
							}
						}
					}

					ctx = ctx.parent;
				}

				return type.symbol !== undefined
					? new ContextTypeReference(type.symbol.escapedName + "")
					: TransformerTypeReference.Unknown;
			}

			return context.metadata.referenceType(
				type,
				false,
				symbol,
				undefined,
				context
			);
		}
	);
}