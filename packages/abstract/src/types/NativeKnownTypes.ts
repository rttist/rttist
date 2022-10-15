import type { Type }                from "../Type";
import { KnownGenericType }         from "./KnownGenericType";

export class PromiseType extends KnownGenericType<readonly [Type]>
{
}

export class ArrayType extends KnownGenericType<readonly [Type]>
{
}

export class ReadonlyArrayType extends KnownGenericType<readonly [Type]>
{
}

export class SetType extends KnownGenericType<readonly [Type]>
{
}

export class WeakSetType extends KnownGenericType<readonly [Type]>
{
}

export class MapType extends KnownGenericType<readonly [Type, Type]>
{
}

export class WeakMapType extends KnownGenericType<readonly [Type, Type]>
{
}

export class TupleType extends KnownGenericType<readonly Type[]>
{
}

const x = {
	[Symbol.iterator]: function(): {
		next(...args: [] | [number]): IteratorResult<number, number>;
		return?(value?: number): IteratorResult<number, number>;
		throw?(e?: any): IteratorResult<number, number>;
	} {
		return null as any;
	},
	// [Symbol.iterator](): {
	// 	next(...args: [] | [number]): IteratorResult<number, number>;
	// 	return?(value?: number): IteratorResult<number, number>;
	// 	throw?(e?: any): IteratorResult<number, number>;
	// } {
	// 	return null as any;
	// }
}

for (const a of x) {
	
}