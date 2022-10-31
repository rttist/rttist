import * as ts                      from "typescript";
import {
	TypeKind,
	NativeTypeKind
}                                   from "rttist";
import { ModuleIds }                from "@rttist/core";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";

/**
 * Return TypeProperties whether the type is a complex native type, such as Uint8Array etc.
 * @param type
 * @param symbol
 */
export function getComplexNativeTypeRef(type: ts.Type, symbol: ts.Symbol): TransformerTypeReference | undefined
{
	return NameMap[symbol.escapedName!];
}

function ct(name: string, kind: NativeTypeKind)
{
	return new TransformerTypeReference(ModuleIds.Native, name, kind);
}

const NameMap: { [name: string]: TransformerTypeReference } = {
	String: TransformerTypeReference.String,
	Number: TransformerTypeReference.Number,
	Boolean: TransformerTypeReference.Boolean,
	BigInt: TransformerTypeReference.BigInt,
	Date: ct("Date", TypeKind.Date),
	Int8Array: ct("Int8Array", TypeKind.Int8Array),
	Uint8Array: ct("Uint8Array", TypeKind.Uint8Array),
	Uint8ClampedArray: ct("Uint8ClampedArray", TypeKind.Uint8ClampedArray),
	Int16Array: ct("Int16Array", TypeKind.Int16Array),
	Uint16Array: ct("Uint16Array", TypeKind.Uint16Array),
	Int32Array: ct("Int32Array", TypeKind.Int32Array),
	Uint32Array: ct("Uint32Array", TypeKind.Uint32Array),
	Float32Array: ct("Float32Array", TypeKind.Float32Array),
	Float64Array: ct("Float64Array", TypeKind.Float64Array),
	BigInt64Array: ct("Float64Array", TypeKind.BigInt64Array),
	BigUint64Array: ct("BigUint64Array", TypeKind.BigUint64Array),
	Symbol: ct("Symbol", TypeKind.Symbol),
	Promise: ct("Promise", TypeKind.PromiseDefinition),
	Error: ct("Error", TypeKind.Error),
	RegExp: ct("RegExp", TypeKind.RegExp),
	ArrayBuffer: ct("ArrayBuffer", TypeKind.ArrayBuffer),
	SharedArrayBuffer: ct("SharedArrayBuffer", TypeKind.SharedArrayBuffer),
	Function: ct("Function", TypeKind.FunctionType),
	Object: ct("Object", TypeKind.ObjectType),
	Atomics: ct("Atomics", TypeKind.Atomics),
	DataView: ct("DataView", TypeKind.DataView),
	Array: ct("Array", TypeKind.ArrayDefinition),
	ReadonlyArray: ct("ReadonlyArray", TypeKind.ReadonlyArrayDefinition),
	Map: ct("Map", TypeKind.MapDefinition),
	WeakMap: ct("WeakMap", TypeKind.WeakMapDefinition),
	Set: ct("Set", TypeKind.SetDefinition),
	WeakSet: ct("WeakSet", TypeKind.WeakSetDefinition),
	Generator: ct("Generator", TypeKind.GeneratorDefinition),
	AsyncGenerator: ct("AsyncGenerator", TypeKind.AsyncGeneratorDefinition),
	Iterator: ct("Iterator", TypeKind.IteratorDefinition),
	Iterable: ct("Iterable", TypeKind.IterableDefinition),
	IterableIterator: ct("IterableIterator", TypeKind.IterableIteratorDefinition),
	AsyncIterator: ct("AsyncIterator", TypeKind.AsyncIteratorDefinition),
	AsyncIterable: ct("AsyncIterable", TypeKind.AsyncIterableDefinition),
	AsyncIterableIterator: ct("AsyncIterableIterator", TypeKind.AsyncIterableIteratorDefinition),
	// Proxy: ct("name", TypeKind.Proxy), // Proxy is only Ctor
};