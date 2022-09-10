import { TypeReference } from "@rttist/abstract";
import * as ts           from "typescript";
import { Context }       from "../contexts/Context";

/**
 * @internal
 */
export type PackageInfo = {
	packageRoot: string;
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

/**
 * Extended Type with our reflection info.
 */
export type ReflectedType = ts.Type & { _reflectId: string };