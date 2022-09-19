import { TypeKind }                 from "@rttist/abstract";
import * as ts                      from "typescript";
import { NativeBaseTypeProperties } from "../declarations/TypeProperties";

/**
 * Return TypeProperties whether the type is a complex native type, such as Uint8Array etc.
 * @param symbol
 */
export function getComplexNativeTypeProperties(symbol: ts.Symbol): NativeBaseTypeProperties | undefined
{
	return NameMap[symbol.escapedName!];
}

const NameMap: { [name: string]: NativeBaseTypeProperties } = {
	Date: { kind: TypeKind.Date },
	Int8Array: { kind: TypeKind.Int8Array },
	Uint8Array: { kind: TypeKind.Uint8Array },
	Uint8ClampedArray: { kind: TypeKind.Uint8ClampedArray },
	Int16Array: { kind: TypeKind.Int16Array },
	Uint16Array: { kind: TypeKind.Uint16Array },
	Int32Array: { kind: TypeKind.Int32Array },
	Uint32Array: { kind: TypeKind.Uint32Array },
	Float32Array: { kind: TypeKind.Float32Array },
	Float64Array: { kind: TypeKind.Float64Array },
	BigInt64Array: { kind: TypeKind.BigInt64Array },
	BigUint64Array: { kind: TypeKind.BigUint64Array },
	Symbol: { kind: TypeKind.Symbol },
	// UniqueSymbol: { kind: TypeKind.UniqueSymbol }, // TODO: Find out what unique symbol is
	Promise: { kind: TypeKind.PromiseDefinition },
	Error: { kind: TypeKind.Error },
	RegExp: { kind: TypeKind.RegExp },
	ArrayBuffer: { kind: TypeKind.ArrayBuffer },
	SharedArrayBuffer: { kind: TypeKind.SharedArrayBuffer },
	Atomics: { kind: TypeKind.Atomics },
	DataView: { kind: TypeKind.DataView },
	Array: { kind: TypeKind.ArrayDefinition },
	Map: { kind: TypeKind.MapDefinition },
	WeakMap: { kind: TypeKind.WeakMapDefinition },
	Set: { kind: TypeKind.SetDefinition },
	WeakSet: { kind: TypeKind.WeakSetDefinition },
	Generator: { kind: TypeKind.GeneratorDefinition },
	AsyncGenerator: { kind: TypeKind.AsyncGeneratorDefinition },
	Iterator: { kind: TypeKind.IteratorDefinition },
	Iterable: { kind: TypeKind.IterableDefinition },
	IterableIterator: { kind: TypeKind.IterableIteratorDefinition },
	AsyncIterator: { kind: TypeKind.AsyncIteratorDefinition },
	AsyncIterable: { kind: TypeKind.AsyncIterableDefinition },
	AsyncIterableIterator: { kind: TypeKind.AsyncIterableIteratorDefinition },
	// Proxy: { kind: TypeKind.Proxy }, // Proxy is only Ctor
};