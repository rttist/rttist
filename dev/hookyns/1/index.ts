import "@rttist/abstract";
import { NativeTypes } from "@rttist/dev-pkg1/dist/native";
import { SomeType } from "./SomeType";

Reflect.getType<any>();
Reflect.getType<unknown>();
Reflect.getType<undefined>();
Reflect.getType<null>();
Reflect.getType<void>();

Reflect.getType<string>();
Reflect.getType<number>();
Reflect.getType<boolean>();
Reflect.getType<String>();
Reflect.getType<Number>();
Reflect.getType<Boolean>();
Reflect.getType<BigInt>();
Reflect.getType<Date>();

Reflect.getType<Array<number>>();
Reflect.getType<number[]>();

Reflect.getType<Map<string, string>>();
Reflect.getType<WeakMap<Function, string>>();
Reflect.getType<Set<string>>();
Reflect.getType<WeakSet<Function>>();

Reflect.getType<Int8Array>();
Reflect.getType<Uint8Array>();
Reflect.getType<Uint8ClampedArray>();
Reflect.getType<Int16Array>();
Reflect.getType<Uint16Array>();
Reflect.getType<Int32Array>();
Reflect.getType<Uint32Array>();
Reflect.getType<Float32Array>();
Reflect.getType<Float64Array>();
Reflect.getType<BigInt64Array>();
Reflect.getType<BigUint64Array>();

Reflect.getType<Symbol>();
Reflect.getType<Promise<boolean>>();
Reflect.getType<Error>();
Reflect.getType<RegExp>();
const regex = /\s\S/;
Reflect.getType<typeof regex>();

Reflect.getType<ArrayBuffer>();
Reflect.getType<SharedArrayBuffer>();
Reflect.getType<Atomics>();
Reflect.getType<DataView>();
Reflect.getType<Generator>();
Reflect.getType<Iterable<any>>();
Reflect.getType<IterableIterator<any>>();
Reflect.getType<AsyncIterator<any>>();
Reflect.getType<AsyncGenerator<any>>();
Reflect.getType<AsyncGeneratorFunction>();

type Obj = { foo: string, bar: Obj };
type ObjAlias = Obj;
Reflect.getType<Obj>();
Reflect.getType<Obj>();
Reflect.getType<ObjAlias>();
Reflect.getType<{ foo: string, bar: number }>();

Reflect.getType<SomeType>();

function genericFunction<T, U>(x: T, y: U) {
	
}

class Foo<T>
{
	native: NativeTypes;
	promise: Promise<boolean>;
	regex = /sss/;
	date = new Date();
	symbol = Symbol();
	array: number[];
	array2: Array<string>;
	array3 = [];
	array4 = Array;
	array5: typeof Array<string>;
	readonlyArray: ReadonlyArray<string>;
	iterableIterator = [].values();
	map = new Map<string, undefined>();
	set = new Set<string>();

	private* generator()
	{
		return 0;
	}

	private async* asyncGenerator()
	{
		return 0;
	}

	function: Function;

	constructor(bar: T, ...rest: any[])
	{
		Reflect.getType<T>();
	}

	doSomething<U>()
	{
		Reflect.getType<T>();
		Reflect.getType<U>();
	}
}

Reflect.construct(Foo, []);

// new,
new Foo<string>("bar").doSomething();

// or Reflect.construct<T>(Function, args: any[], newTarget: Function),
Reflect.construct<Foo<string>>(Foo, ["some", "args"]).doSomething();

// or Reflect.construct(Function, typeArgs: Type[], args: any[], newTarget: Function),
Reflect.constructGeneric(Foo, [Reflect.getType<string>()], ["some", "args"]).doSomething();

// or this too.
function baz<T>(Ctor: Function, ...args: any[]): any
{
	return Reflect.constructGeneric(Ctor, [Reflect.getType<T>()], args);
}

(baz<string>(Foo, "some", "args") as Foo<string>).doSomething();
