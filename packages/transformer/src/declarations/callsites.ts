import type * as ts                      from "typescript";
import type { Context }                  from "../contexts/Context";
import { ClassContextTypeReference }     from "./ClassContextTypeReference";
import type { TransformerTypeReference } from "./TransformerTypeReference";
import type { ClassTypeReference }       from "./ClassTypeReference";
import type { ContextTypeReference }     from "./ContextTypeReference";

export type TypeArgumentsInfo = Array<undefined | [ts.Type, ts.Symbol | undefined]>;

/**
 * References to all type parameters for callsite.
 */
export type CallsiteReference = Array<null | TransformerTypeReference | ContextTypeReference | ClassTypeReference | ClassContextTypeReference>;

export type CallsiteReferenceFactory = (
	typeArgTypes: Array<undefined | [ts.Type, ts.Symbol | undefined]>,
	context: Context
) => CallsiteReference;