import { Type } from "./Type";
import { ParameterFlags, TypeKind } from "./enums";
import { FunctionType, LiteralType } from "./types";
import { ModuleIds, TypeIds } from "@rttist/core";

let created = false;
let anyType: Type;
let unknownFunction: Type;
let nativeTypes: { [key: string]: Type } = {};
let nativeGenericTypeDefinitions: {
	ArrayDefinition: Type;
	ReadonlyArrayDefinition: Type;
	TupleDefinition: Type;
	MapDefinition: Type;
	WeakMapDefinition: Type;
	SetDefinition: Type;
	WeakSetDefinition: Type;
	PromiseDefinition: Type;
	GeneratorDefinition: Type;
	AsyncGeneratorDefinition: Type;
	IteratorDefinition: Type;
	IterableDefinition: Type;
	IterableIteratorDefinition: Type;
	AsyncIteratorDefinition: Type;
	AsyncIterableDefinition: Type;
	AsyncIterableIteratorDefinition: Type;
} = {} as any;

/**
 * @internal
 */
export function getNativeTypes() {
	if (!created) {
		anyType = new Type({
			kind: TypeKind.Interface,
			name: "Array",
			id: `#Array{${TypeIds.Any}}`,
			module: ModuleIds.Native,
			genericTypeDefinition: "#Array",
			typeArguments: [TypeIds.Any],
		});

		unknownFunction = new FunctionType({
			kind: TypeKind.Function,
			name: "Function",
			id: "#Function:unknown",
			module: ModuleIds.Native,
			signatures: [
				{
					parameters: [
						{
							name: "x",
							flags: ParameterFlags.Rest,
							type: anyType.id,
						},
					],
					returnType: TypeIds.Unknown,
				},
			],
		});

		nativeGenericTypeDefinitions = {
			ArrayDefinition: cn("Array", "ArrayDefinition"),
			ReadonlyArrayDefinition: cn("ReadonlyArray", "ReadonlyArrayDefinition"),
			TupleDefinition: cn("Tuple", "TupleDefinition"),
			MapDefinition: cn("Map", "MapDefinition"),
			WeakMapDefinition: cn("WeakMap", "WeakMapDefinition"),
			SetDefinition: cn("Set", "SetDefinition"),
			WeakSetDefinition: cn("WeakSet", "WeakSetDefinition"),
			PromiseDefinition: cn("Promise", "PromiseDefinition"),
			GeneratorDefinition: cn("Generator", "GeneratorDefinition"),
			AsyncGeneratorDefinition: cn("AsyncGenerator", "AsyncGeneratorDefinition"),
			IteratorDefinition: cn("Iterator", "IteratorDefinition"),
			IterableDefinition: cn("Iterable", "IterableDefinition"),
			IterableIteratorDefinition: cn("IterableIterator", "IterableIteratorDefinition"),
			AsyncIteratorDefinition: cn("AsyncIterator", "AsyncIteratorDefinition"),
			AsyncIterableDefinition: cn("AsyncIterable", "AsyncIterableDefinition"),
			AsyncIterableIteratorDefinition: cn("AsyncIterableIterator", "AsyncIterableIteratorDefinition"),
		};

		nativeTypes = {
			Invalid: cn("Invalid", "Invalid", ModuleIds.Invalid),
			NonPrimitiveObject: cn("object", "NonPrimitiveObject"),
			Any: cn("any", "Any"),
			Unknown: cn("unknown", "Unknown"),
			Void: cn("void", "Void"),
			Never: cn("never", "Never"),
			Null: cn("null", "Null"),
			Undefined: cn("undefined", "Undefined"),
			Intrinsic: cn("intrinsic", "Intrinsic"),
			String: cn("String", "String"),
			Number: cn("Number", "Number"),
			BigInt: cn("BigInt", "BigInt"),
			Boolean: cn("Boolean", "Boolean"),
			True: new LiteralType({
				id: TypeIds.True,
				kind: TypeKind.True,
				name: "true",
				module: ModuleIds.Native,
				value: true,
			}),
			False: new LiteralType({
				id: TypeIds.False,
				kind: TypeKind.False,
				name: "false",
				module: ModuleIds.Native,
				value: false,
			}),
			Date: cn("Date", "Date"),
			Error: cn("Error", "Error"),
			Symbol: cn("Symbol", "Symbol"),
			UniqueSymbol: cn("UniqueSymbol", "UniqueSymbol"),
			RegExp: cn("RegExp", "RegExp"),
			Int8Array: cn("Int8Array", "Int8Array"),
			Uint8Array: cn("Uint8Array", "Uint8Array"),
			Uint8ClampedArray: cn("Uint8ClampedArray", "Uint8ClampedArray"),
			Int16Array: cn("Int16Array", "Int16Array"),
			Uint16Array: cn("Uint16Array", "Uint16Array"),
			Int32Array: cn("Int32Array", "Int32Array"),
			Uint32Array: cn("Uint32Array", "Uint32Array"),
			Float32Array: cn("Float32Array", "Float32Array"),
			Float64Array: cn("Float64Array", "Float64Array"),
			BigInt64Array: cn("BigInt64Array", "BigInt64Array"),
			BigUint64Array: cn("BigUint64Array", "BigUint64Array"),
			ArrayBuffer: cn("ArrayBuffer", "ArrayBuffer"),
			SharedArrayBuffer: cn("SharedArrayBuffer", "SharedArrayBuffer"),
			Atomics: cn("Atomics", "Atomics"),
			DataView: cn("DataView", "DataView"),
			ArrayDefinition: nativeGenericTypeDefinitions.ArrayDefinition,
			ReadonlyArrayDefinition: nativeGenericTypeDefinitions.ReadonlyArrayDefinition,
			TupleDefinition: nativeGenericTypeDefinitions.TupleDefinition,
			MapDefinition: nativeGenericTypeDefinitions.MapDefinition,
			WeakMapDefinition: nativeGenericTypeDefinitions.WeakMapDefinition,
			SetDefinition: nativeGenericTypeDefinitions.SetDefinition,
			WeakSetDefinition: nativeGenericTypeDefinitions.WeakSetDefinition,
			PromiseDefinition: nativeGenericTypeDefinitions.PromiseDefinition,
			GeneratorDefinition: nativeGenericTypeDefinitions.GeneratorDefinition,
			AsyncGeneratorDefinition: nativeGenericTypeDefinitions.AsyncGeneratorDefinition,
			IteratorDefinition: nativeGenericTypeDefinitions.IteratorDefinition,
			IterableDefinition: nativeGenericTypeDefinitions.IterableDefinition,
			IterableIteratorDefinition: nativeGenericTypeDefinitions.IterableIteratorDefinition,
			AsyncIteratorDefinition: nativeGenericTypeDefinitions.AsyncIteratorDefinition,
			AsyncIterableDefinition: nativeGenericTypeDefinitions.AsyncIterableDefinition,
			AsyncIterableIteratorDefinition: nativeGenericTypeDefinitions.AsyncIterableIteratorDefinition,
		};

		created = true;
	}

	return {
		AnyArray: anyType,
		UnknownFunction: unknownFunction,
		nativeTypes,
		nativeGenericTypeDefinitions,
	};
}

function cn(name: string, propName: keyof TypeKind | keyof typeof TypeIds, module: string = ModuleIds.Native): Type {
	const kind = (TypeKind as any)[propName];
	const id = (TypeIds as any)[propName];
	const isGenericTypeDefinition = propName.endsWith("Definition");

	if (id === undefined || kind === undefined) {
		throw new Error(`Invalid prop name. kind = ${kind}, id = ${id}`);
	}

	return new Type({ kind, name, id, module, isGenericTypeDefinition });
}
