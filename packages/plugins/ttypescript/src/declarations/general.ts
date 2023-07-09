import type * as ts                      from "typescript";
import type {
	NativeTypeKind,
	TypeIdentifier
}                                        from "rttist";
import type { Context }                  from "../contexts/Context";
import type { TransformerTypeReference } from "./TransformerTypeReference";
import type { TypeProperties }           from "./TypeProperties";
import type { TypePropertiesWithId }     from "./TypeProperties";

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
	properties?: TypePropertiesWithId;
	nullable: boolean;
};

/**
 * @internal
 */
export type TransformerVisitor = (node: ts.Node, context: Context) => ts.VisitResult<ts.Node>;

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

/**
 * Type serializer
 * @return Array of uint8. Common array is used
 */
export type TypeSerializer = (typeProperties: TypeProperties & { id?: TypeIdentifier }) => number[];