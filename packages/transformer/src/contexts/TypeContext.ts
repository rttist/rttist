import * as ts from "typescript";
import { Context } from "./Context";

/**
 * Context of type
 */
export class TypeContext {
	constructor(public context: Context, public typeNode: ts.TypeNode, public type: ts.Type)
	{
	}
}