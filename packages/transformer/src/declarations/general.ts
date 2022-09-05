import { TypeReference } from "@rtti/abstract";
import * as ts           from "typescript";
import { Context }       from "../contexts/Context";

/**
 * @internal
 */
export type PackageInfo = {
	rootDir: string; // TODO: Rename to packageRoot
	name: string;
}

/**
 * @internal
 */
export type TransformerVisitor = (node: ts.Node, context: Context) => ts.VisitResult<ts.Node>;

/**
 * Request given keys to exist in type.
 */
export type Match<K extends keyof T, T> = {
	[P in K]: T[P];
};

/**
 * TypeReference used inside transformer
 */
export type TransformerTypeReference = TypeReference;
