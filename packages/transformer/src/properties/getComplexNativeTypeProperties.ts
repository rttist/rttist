import { TypeKind }                 from "@rttist/abstract";
import { ModuleIds }                from "@rttist/core";
import * as ts                      from "typescript";
import { TransformerTypeReference } from "../declarations/general";

/**
 * Return TypeProperties whether the type is a complex native type, such as Uint8Array etc.
 * @param symbol
 */
export function getComplexNativeTypeProperties(symbol: ts.Symbol): TransformerTypeReference | undefined
{
	return NameMap[symbol.escapedName!];
}

const NameMap: { [name: string]: TransformerTypeReference } = {
	Date: new TransformerTypeReference(ModuleIds.Native, "Date", TypeKind.Date),
	Int8Array: new TransformerTypeReference(ModuleIds.Native, "Int8Array", TypeKind.Int8Array),
	Uint8Array: new TransformerTypeReference(ModuleIds.Native, "Uint8Array", TypeKind.Uint8Array),
	Uint8ClampedArray: new TransformerTypeReference(ModuleIds.Native, "Uint8ClampedArray", TypeKind.Uint8ClampedArray),
	Int16Array: new TransformerTypeReference(ModuleIds.Native, "Int16Array", TypeKind.Int16Array),
	Uint16Array: new TransformerTypeReference(ModuleIds.Native, "Uint16Array", TypeKind.Uint16Array),
	Int32Array: new TransformerTypeReference(ModuleIds.Native, "Int32Array", TypeKind.Int32Array),
	Uint32Array: new TransformerTypeReference(ModuleIds.Native, "Uint32Array", TypeKind.Uint32Array),
	Float32Array: new TransformerTypeReference(ModuleIds.Native, "Float32Array", TypeKind.Float32Array),
	Float64Array: new TransformerTypeReference(ModuleIds.Native, "Float64Array", TypeKind.Float64Array),
	BigInt64Array: new TransformerTypeReference(ModuleIds.Native, "Float64Array", TypeKind.BigInt64Array),
	BigUint64Array: new TransformerTypeReference(ModuleIds.Native, "BigUint64Array", TypeKind.BigUint64Array),
	Symbol: new TransformerTypeReference(ModuleIds.Native, "Symbol", TypeKind.Symbol),
	// UniqueSymbol: new TransformerTypeReference(ModuleIds.Native, "name", TypeKind.UniqueSymbol), // TODO: Find out what unique symbol is
	Promise: new TransformerTypeReference(ModuleIds.Native, "Promise", TypeKind.PromiseDefinition),
	Error: new TransformerTypeReference(ModuleIds.Native, "Error", TypeKind.Error),
	RegExp: new TransformerTypeReference(ModuleIds.Native, "RegExp", TypeKind.RegExp),
	ArrayBuffer: new TransformerTypeReference(ModuleIds.Native, "ArrayBuffer", TypeKind.ArrayBuffer),
	SharedArrayBuffer: new TransformerTypeReference(ModuleIds.Native, "SharedArrayBuffer", TypeKind.SharedArrayBuffer),
	Atomics: new TransformerTypeReference(ModuleIds.Native, "Atomics", TypeKind.Atomics),
	DataView: new TransformerTypeReference(ModuleIds.Native, "DataView", TypeKind.DataView),
	Array: new TransformerTypeReference(ModuleIds.Native, "Array", TypeKind.ArrayDefinition),
	Map: new TransformerTypeReference(ModuleIds.Native, "Map", TypeKind.MapDefinition),
	WeakMap: new TransformerTypeReference(ModuleIds.Native, "WeakMap", TypeKind.WeakMapDefinition),
	Set: new TransformerTypeReference(ModuleIds.Native, "Set", TypeKind.SetDefinition),
	WeakSet: new TransformerTypeReference(ModuleIds.Native, "WeakSet", TypeKind.WeakSetDefinition),
	Generator: new TransformerTypeReference(ModuleIds.Native, "Generator", TypeKind.GeneratorDefinition),
	AsyncGenerator: new TransformerTypeReference(ModuleIds.Native, "AsyncGenerator", TypeKind.AsyncGeneratorDefinition),
	Iterator: new TransformerTypeReference(ModuleIds.Native, "Iterator", TypeKind.IteratorDefinition),
	Iterable: new TransformerTypeReference(ModuleIds.Native, "Iterable", TypeKind.IterableDefinition),
	IterableIterator: new TransformerTypeReference(ModuleIds.Native, "IterableIterator", TypeKind.IterableIteratorDefinition),
	AsyncIterator: new TransformerTypeReference(ModuleIds.Native, "AsyncIterator", TypeKind.AsyncIteratorDefinition),
	AsyncIterable: new TransformerTypeReference(ModuleIds.Native, "AsyncIterable", TypeKind.AsyncIterableDefinition),
	AsyncIterableIterator: new TransformerTypeReference(ModuleIds.Native, "AsyncIterableIterator", TypeKind.AsyncIterableIteratorDefinition),
	// Proxy: new TransformerTypeReference(ModuleIds.Native, "name", TypeKind.Proxy), // Proxy is only Ctor
};