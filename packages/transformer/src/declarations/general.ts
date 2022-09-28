import { NativeTypeKind }           from "@rttist/abstract";
import * as ts                      from "typescript";
import { Context }                  from "../contexts/Context";
import { TransformerTypeReference } from "./TransformerTypeReference";
import { TypeProperties }           from "./TypeProperties";

/**
 * Type for `package.json` structure.
 */
export type PackageJson = {
	name?: string;
	dependencies?: string[];
	devDependencies?: string[];
	reflection?: {
		index?: string;
		typelib?: string;
	}
};

/**
 * Package information.
 * @internal
 */
export type PackageInfo = {
	packageRoot: string;
	name: string;
	packageJson: PackageJson
}

/**
 * Type information.
 * @internal
 */
export type TypeInfo = {
	typeReference: TransformerTypeReference;
	type: ts.Type;
	properties?: TypeProperties;
};

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
 * TypeReference for native types used inside transformer.
 */
export type TransformerNativeTypeReference = { kind: NativeTypeKind };

export type NativeTransformerTypeReference = TransformerTypeReference & {
	get nativeReference(): TransformerNativeTypeReference;
};

/**
 * TS Type with our type reference.
 */
export type ReflectedTypeWithReference = ts.Type & { _typeReference: TransformerTypeReference };

/**
 * TS Symbol with our type reference.
 */
export type ReflectedSymbolWithReference = ts.Symbol & { _typeReference: TransformerTypeReference };

/**
 * Extended SourceFile with our reflection info.
 */
export type ReflectedSourceFileWithReference = ts.SourceFile & { _reflectId: string };