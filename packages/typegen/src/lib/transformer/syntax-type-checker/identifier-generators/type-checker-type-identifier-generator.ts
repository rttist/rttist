import { TypeIds } from "@rttist/core";
import { TypeIdentifier } from "rttist";
import * as ts from "typescript";
import { Logger } from "../../../logging";
import {
	ReflectedSymbolWithReference,
	ReflectedTypeWithReference,
	TransformerTypeReference,
} from "../../../metadata/transformer-type-reference";
import { printTypeDebugInfo } from "../../tracers/printTypeDebugInfo";
import { isExported } from "../../utils/isExported";
import { getDeclaration } from "../../utils/symbolHelpers";
import {
	getMajorTypeFlag,
	getSymbol,
	getUniqueSymbolName,
	isInvalidType,
	isLiteral,
	toBigIntLiteral,
} from "../../utils/typeHelpers";
import { ScopeManager } from "../scopes/scope-manager";
import { ModuleIdentifierGenerator } from "./module-identifier-generator";
import { Config } from "../../../config/config";
import { wellKnownType } from "./type-identifier-generator";

export class TypeCheckerTypeIdentifierGenerator {
	constructor(
		// private readonly scopeRegistry: ScopeRegistry
		private readonly scopeManager: ScopeManager,
		private readonly moduleIdentifierGenerator: ModuleIdentifierGenerator,
		private readonly config: Config,
		private readonly typeChecker: ts.TypeChecker, // private readonly transformerContext: TransformerContext
		private readonly logger: Logger
	) {}

	getTypeCheckerTypeIdentifier(
		type: ts.Type,
		symbol: ts.Symbol | undefined,
		nullable: boolean
	): TypeIdentifier | undefined {
		if (isInvalidType(type)) {
			return TypeIds.Invalid;
		}

		const primitiveTypeReference = getPrimitiveTypeReference(type);

		if (primitiveTypeReference !== undefined) {
			return primitiveTypeReference;
		}

		const literalTypeReference = getLiteralTypeReference(type);

		if (literalTypeReference !== undefined) {
			return literalTypeReference;
		}

		// const isAnonymous = ((type as any).objectFlags & ts.ObjectFlags.Anonymous) !== 0;
		// const isTypeAlias = symbol && (symbol.flags & ts.SymbolFlags.TypeAlias) !== 0 || false;
		// const useProvidedSymbol = isAnonymous || isTypeAlias;

		// Use symbol always when provided.
		const useProvidedSymbol = symbol !== undefined && (symbol.flags & ts.SymbolFlags.TypeAlias) !== 0;

		// In case of TypeAlias ignore the stored ref on type, instead try to find the ref on the symbol.
		if (useProvidedSymbol && hasReflectedTypeReference(symbol!)) {
			// console.log("!! Skipped thanks to stored type ref on symbol!", symbol._typeReference.id); // TODO: remove
			return symbol._typeReference.id;
		}

		if (!useProvidedSymbol && hasReflectedTypeReference(type)) {
			// console.log("!! Skipped thanks to stored type ref on type!", type._typeReference.id); // TODO: remove
			return type._typeReference.id;
		}

		let typeReference: TypeIdentifier | undefined = undefined;

		// If no symbol defined, take it from type
		if (symbol === undefined || !useProvidedSymbol) {
			symbol = getSymbol(type, this.typeChecker);
		}

		const declaration = getDeclaration(symbol);

		// If there is no declaration and/or symbol
		if (!declaration || !symbol) {
			return this.getTypeRefWithoutDeclaration(type, symbol, nullable);
		}

		const sourceFile = declaration.getSourceFile();

		// if (sourceFile.fileName !== undefined && !canIncludeSourceFile(sourceFile.fileName, this.config)) {
		// 	return TypeIds.Invalid;
		// }

		const sourceFileId = this.moduleIdentifierGenerator.generateModuleIdentifier(sourceFile.fileName);

		// If it's type parameter
		if ((type.flags & ts.TypeFlags.TypeParameter) !== 0) {
			typeReference = this.getTypeRefOfTypeParameter(
				type,
				nullable,
				symbol,
				declaration,
				sourceFile,
				sourceFileId,
				this.typeChecker
			);
		}
		// TypeLiteral - it is not stored under any variable/alias anything, so we can generate "random" identifier.
		else if (declaration.kind === ts.SyntaxKind.TypeLiteral) {
			typeReference = sourceFileId + ":" + "AnonymousType:" + declaration.pos;
		} else {
			// const knownTypeReference = getWellKnownTypeRef(sourceFileId, type, symbol);
			//
			// if (knownTypeReference !== undefined) {
			// 	return knownTypeReference;
			// }

			// TODO: It is important to distinguish Generic type definition and generic type;;; No it's not!? Everything we get by this typechecker generator should be always some specific generic type.
			let typeArguments =
				(type as ts.GenericType).typeArguments?.filter(
					(t) => (t.flags & ts.TypeFlags.TypeParameter) === 0 || (t.symbol as any)?.parent !== symbol
				) || []; // TODO: Can be problem if the args is TypeParameter from some parent (eg. passing TypeParameter of class to some type of property)

			// const isGenericTypeDefinition = typeArguments.length !== 0 && (type as ts.GenericType).target == type;

			// // It has no type arguments or it's generic type definition and it is native type
			// if ((isGenericTypeDefinition || typeArguments.length === 0) && sourceFileId === ModuleIds.Native) {
			// 	if ((type.flags & ts.TypeFlags.UniqueESSymbol) !== 0) {
			// 		const name = getUniqueSymbolName(type);
			//
			// 		if (ESSymbols.has(name!)) {
			// 			return "UniqueSymbol@" + name;
			// 		}
			// 	}
			//
			// 	typeReference = getComplexNativeTypeRef(symbol);
			//
			// 	if (typeReference === undefined) {
			// 		// if (transformerContext.config.devMode) {
			// 		// 	log.warn("Unhandled complex native type.", printTypeDebugInfo(type, typeChecker));
			// 		// }
			//
			// 		typeReference = TypeIds.Invalid;
			// 	}
			// } else {
			// typeReference = getUnionOrIntersectionTypeRef(type, symbol, transformerContext);
			//
			// if (typeReference === undefined) {
			let typeName = symbol.escapedName.toString();

			if ((type.flags & ts.TypeFlags.UniqueESSymbol) !== 0) {
				let name = getUniqueSymbolName(type);
				typeName = name ? "UniqueSymbol@" + name : typeName;
			}

			let isKnownType = wellKnownType.has(typeName);

			if (
				(type as ts.GenericType).target &&
				((type as ts.GenericType).target.objectFlags & ts.ObjectFlags.Tuple) !== 0
			) {
				typeName = "Tuple";
				isKnownType = true;
				typeArguments = (type as any).resolvedTypeArguments ?? [];
			}

			// If it is not exported, the type name is not guaranteed to be unique.
			// So we will generate the path to the root declaration statement
			if (declaration && !isExported(declaration)) {
				// if (((type as any).objectFlags & ts.ObjectFlags.Anonymous) !== 0)
				let parentSymbol: ts.Symbol = (symbol as any).parent;

				while (parentSymbol !== undefined && (parentSymbol.flags & ts.SymbolFlags.Module) === 0) {
					typeName = parentSymbol.escapedName + "." + typeName;
					parentSymbol = (parentSymbol as any).parent;
				}
			}

			return (
				(isKnownType ? "#" : sourceFileId + ":") +
				typeName +
				(typeArguments.length
					? "{" +
					  typeArguments
							.map((typeArg) => this.getTypeCheckerTypeIdentifier(typeArg, undefined, false))
							.join(",") +
					  "}"
					: "")
			);

			// typeReference = new TransformerTypeReference(
			// 	sourceFileId,
			// 	typeName,
			// 	undefined,
			// 	typeArguments.map((typeArg) => getTypeRef(typeArg, false, undefined, transformerContext).id),
			// 	sourceFile
			// );
			// } else {
			// 	log.ifDebug(() => ["Handled as union: ", printTypeDebugInfo(type, typeChecker)]);
			// }
			// }
		}

		if (typeReference === undefined) {
			typeReference = TypeIds.Invalid;
			// log.warn("Unhandled type kind. Unable to generate type id.", printTypeDebugInfo(type, typeChecker));
		}

		// Store the Reference on the type.
		setReflectedTypeReference(
			type,
			useProvidedSymbol ? symbol : undefined,
			new TransformerTypeReference(typeReference)
		);

		return typeReference;
	}

	private getTypeRefWithoutDeclaration(
		type: ts.Type,
		symbol: ts.Symbol | undefined,
		nullable: boolean
	): TypeIdentifier {
		// // try to check if it's primitive type
		// let typeReference = getPrimitiveTypeReference(type);
		//
		// if (typeReference === undefined)
		// {

		// Some system union or intersection.
		let typeReference = this.getUnionOrIntersectionTypeRef(type, symbol);

		if (typeReference === undefined) {
			if (
				(type as ts.GenericType).target &&
				((type as ts.GenericType).target.objectFlags & ts.ObjectFlags.Tuple) !== 0
			) {
				const typeArguments = (type as any).resolvedTypeArguments ?? [];

				return `${TypeIds.TupleDefinition}{${typeArguments
					.map((typeArg: ts.Type) => this.getTypeCheckerTypeIdentifier(typeArg, undefined, false))
					.join(",")}}`;
			}

			// TODO: Log this.
			// log.ifWarn(() => [
			// 	`Unable to generate Id for type without ${!symbol ? "symbol" : "declaration"}.`,
			// 	printTypeDebugInfo(type, transformerContext.typeChecker),
			// ]);

			typeReference = TypeIds.Invalid;
		}
		// }

		// TODO: Solve this, this reference was stored on native string type:
		//  { module: "@quick-tests/dist/1/index", name: "__type.bar", id: "@quick-tests/dist/1/index::__type.bar" }
		// // In case it is a native primitive type and given symbol is not the same as type's symbol,
		// do not store reference generated over some alias directly on native string.
		// else if (type.symbol !== undefined && type.symbol !== symbol)
		// {
		// 	// Store the Reference on the type.
		// 	setReflectedTypeReference(type, symbol, typeReference);
		// 	return typeReference;
		// }

		// Store the Reference on the type.
		setReflectedTypeReference(type, symbol, new TransformerTypeReference(typeReference));

		return typeReference;
	}

	private getUnionOrIntersectionTypeRef(type: ts.Type, symbol: ts.Symbol | undefined) {
		if ((type.flags & ts.TypeFlags.EnumLike) !== 0) {
			return undefined;
		}

		if (type.isUnion()) {
			return `#|{${type.types.map((t) => this.getTypeCheckerTypeIdentifier(t, symbol, false)).join(",")}`;
		}

		if (type.isIntersection()) {
			return `#&{${type.types.map((t) => this.getTypeCheckerTypeIdentifier(t, symbol, false)).join(",")}`;
		}

		return undefined;
	}

	private getTypeRefOfTypeParameter(
		type: ts.Type,
		nullable: boolean,
		symbol: ts.Symbol,
		declaration: ts.Declaration,
		sourceFile: ts.SourceFile,
		sourceFileId: string,
		typeChecker: ts.TypeChecker
		// transformerContext: TransformerContext
	): TypeIdentifier {
		const parentSymbol = (type.symbol as any)?.parent; // TODO: Why type.symbol and not just symbol?
		const parentType = parentSymbol && typeChecker.getDeclaredTypeOfSymbol(parentSymbol);

		if (parentType) {
			const parentRef = this.getTypeCheckerTypeIdentifier(parentType, parentSymbol, nullable);
			return (parentRef ? parentRef : sourceFileId) + ":" + symbol.escapedName;
		} else {
			const declaration = getDeclaration(symbol);

			if (declaration) {
				const parentRef = this.getTypeCheckerTypeIdentifier(
					typeChecker.getTypeAtLocation(declaration.parent),
					undefined,
					nullable
				);

				if (parentRef) {
					return parentRef + ":" + symbol.escapedName;
				}
			}
		}

		this.logger.ifWarn(() => [
			"Unable to properly generate Id for a TypeParameter because parent type is unknown.",
			printTypeDebugInfo(type, this.typeChecker),
		]);

		return sourceFileId + ":" + symbol.escapedName + declaration.pos.toString();
	}
}

// function ct(name: string, kind: NativeTypeKind)
// {
// 	return new TransformerTypeReference(ModuleIds.Native, name, kind);
// }
//
// const ComplexTypesRefMap: { [name: string]: TypeIdentifier } = {
// 	// String: TypeIds.String,
// 	// Number: TypeIds.Number,
// 	// Boolean: TypeIds.Boolean,
// 	// BigInt: TypeIds.BigInt,
// 	// Date: TypeIds.Date,
// 	Error: TypeIds.Error,
// 	Int8Array: TypeIds.Int8Array,
// 	Uint8Array: TypeIds.Uint8Array,
// 	Uint8ClampedArray: TypeIds.Uint8ClampedArray,
// 	Int16Array: TypeIds.Int16Array,
// 	Uint16Array: TypeIds.Uint16Array,
// 	Int32Array: TypeIds.Int32Array,
// 	Uint32Array: TypeIds.Uint32Array,
// 	Float32Array: TypeIds.Float32Array,
// 	Float64Array: TypeIds.Float64Array,
// 	BigInt64Array: TypeIds.BigInt64Array,
// 	BigUint64Array: TypeIds.BigUint64Array,
// 	Symbol: TypeIds.Symbol,
// 	Promise: TypeIds.PromiseDefinition,
// 	RegExp: TypeIds.RegExp,
// 	ArrayBuffer: TypeIds.ArrayBuffer,
// 	SharedArrayBuffer: TypeIds.SharedArrayBuffer,
// 	Function: TypeIds.Function,
// 	// Object: TypeIds.Object,
// 	Atomics: TypeIds.Atomics,
// 	DataView: TypeIds.DataView,
// 	Array: TypeIds.ArrayDefinition,
// 	// Tuple: TypeIds.Array,
// 	ReadonlyArray: TypeIds.ReadonlyArrayDefinition,
// 	Map: TypeIds.MapDefinition,
// 	WeakMap: TypeIds.WeakMapDefinition,
// 	Set: TypeIds.SetDefinition,
// 	WeakSet: TypeIds.WeakSetDefinition,
// 	Generator: TypeIds.GeneratorDefinition,
// 	AsyncGenerator: TypeIds.AsyncGeneratorDefinition,
// 	Iterator: TypeIds.IteratorDefinition,
// 	Iterable: TypeIds.IterableDefinition,
// 	IterableIterator: TypeIds.IterableIteratorDefinition,
// 	AsyncIterator: TypeIds.AsyncIteratorDefinition,
// 	AsyncIterable: TypeIds.AsyncIterableDefinition,
// 	AsyncIterableIterator: TypeIds.AsyncIterableIteratorDefinition,
// 	// Proxy: ct("name", TypeKind.Proxy), // Proxy is only Ctor
// };

// function getWellKnownTypeRef(
// 	sourceFileId: string,
// 	type: ts.Type,
// 	symbol: ts.Symbol
// ): TransformerTypeReference | undefined
// {
// 	return NameMap[sourceFileId + ":" + symbol.escapedName];
// }
//
// function ct(module: string, name: string, kind: NativeTypeKind)
// {
// 	return new TransformerTypeReference(module, name, kind);
// }
//
// const NameMap: { [name: string]: TypeIdentifier } = {
// 	"@rttist/dist/Type:Type": ct("@rttist/dist/Type", "Type", TypeKind.RttistType),
// 	"@rttist/dist/Module:Module": ct("@rttist/dist/Module", "Module", TypeKind.RttistModule),
// };

const PrimitiveTypesRefMap: { [flag: number]: TypeIdentifier } = {
	[ts.TypeFlags.String]: TypeIds.String,
	[ts.TypeFlags.Number]: TypeIds.Number,
	[ts.TypeFlags.Boolean]: TypeIds.Boolean,
	[ts.TypeFlags.BigInt]: TypeIds.BigInt,
	[ts.TypeFlags.ESSymbol]: TypeIds.Symbol,
	[ts.TypeFlags.Any]: TypeIds.Any,
	[ts.TypeFlags.Unknown]: TypeIds.Unknown,
	[ts.TypeFlags.Never]: TypeIds.Never,
	[ts.TypeFlags.Undefined]: TypeIds.Undefined,
	[ts.TypeFlags.Null]: TypeIds.Null,
	[ts.TypeFlags.Void]: TypeIds.Void,
};

export function getPrimitiveTypeReference(type: ts.Type): TypeIdentifier | undefined {
	if ((type.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
		return (type as any).intrinsicName === "true" ? TypeIds.True : TypeIds.False;
	}

	if ((type.flags & ts.TypeFlags.NonPrimitive) !== 0 && (type as any).intrinsicName === "object") {
		return TypeIds.NonPrimitiveObject;
	}

	return PrimitiveTypesRefMap[getMajorTypeFlag(type)];
}

function getLiteralTypeReference(type: ts.Type) {
	if (isLiteral(type)) {
		const val =
			typeof type.value === "object"
				? toBigIntLiteral(type.value as ts.PseudoBigInt)
				: typeof type.value === "string"
				? "'" + type.value + "'"
				: type.value;

		return "#L(" + val + ")";
	}
}

// /**
//  * Returns id of given type
//  * @param type
//  * @param nullable Type is nullable
//  * @param symbol
//  * @param transformerContext
//  */
// export function getTypeRef(
// 	type: ts.Type,
// 	nullable: boolean, // TODO: Implement
// 	symbol: ts.Symbol | undefined,
// 	transformerContext: TransformerContext
// ): TransformerTypeReference
// {
//
// }

function hasReflectedTypeReference(type: ts.Type): type is ReflectedTypeWithReference;
function hasReflectedTypeReference(symbol: ts.Symbol): symbol is ReflectedSymbolWithReference;
function hasReflectedTypeReference(typeOrSymbol: ts.Type | ts.Symbol): boolean {
	return (typeOrSymbol as ReflectedTypeWithReference | ReflectedSymbolWithReference)._typeReference !== undefined;
}

function setReflectedTypeReference(type: ts.Type, symbol: ts.Symbol | undefined, ref: TransformerTypeReference) {
	if ((type as ReflectedTypeWithReference)._typeReference === undefined) {
		(type as ReflectedTypeWithReference)._typeReference = ref;
	}

	if (symbol !== undefined) {
		(symbol as ReflectedSymbolWithReference)._typeReference = ref;
	}
}
