import { TypeReference }  from "@rttist/abstract";
import * as ts            from "typescript";
import { Context }        from "../contexts/Context";
import { TypeProperties } from "./TypeProperties";

export type PackageJson = {
	name?: string;
	dependencies?: string[];
	devDependencies?: string[];
};

/**
 * @internal
 */
export type PackageInfo = {
	packageRoot: string;
	name: string;
	packageJson: PackageJson
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
 * Extended Type with our reflection type id.
 */
export type ReflectedTypeWithIdentifier = ts.Type & { _reflectId: string };

/**
 * Extended SourceFile with our reflection info.
 */
export type ReflectedSourceFile = ts.SourceFile & { _reflectId: string }; // TODO: rename


export type TypeInfo = { properties?: TypeProperties };