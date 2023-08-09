import * as ts from "typescript";
import { Context } from "../lib/transformer/contexts/context";

/**
 * @internal
 */
export type TransformerVisitor = (node: ts.Node, context: Context) => void;
