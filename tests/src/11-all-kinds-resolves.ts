import {
	getType,
	Type
} from "rttist";

test("Types of all kinds resolves to Type", () => {

	expect(getType<any>()).toBe(Type.Any);
	expect(getType<unknown>()).toBe(Type.Unknown);
	expect(getType<undefined>()).toBe(Type.Undefined);
	expect(getType<null>()).toBe(Type.Null);
	expect(getType<void>()).toBe(Type.Void);

	expect(getType<string>()).toBe(Type.String);
	expect(getType<number>()).toBe(Type.Number);
	expect(getType<boolean>()).toBe(Type.Boolean);
	expect(getType<true>()).toBe(Type.True);
	expect(getType<false>()).toBe(Type.False);
	expect(getType<String>()).toBe(Type.String);
	expect(getType<Number>()).toBe(Type.Number);
	expect(getType<Boolean>()).toBe(Type.Boolean);
	expect(getType<BigInt>()).toBe(Type.BigInt);
	expect(getType<Date>()).toBe(Type.Date);

	const arr = getType<Array<number>>();
	expect(arr.isArray()).toBeTruthy();
	expect(getType<number[]>()).toBe(arr);
	if (arr.isArray())
	{
		expect(arr.getTypeArguments()[0]).toBe(Type.Number);
		expect(arr.genericTypeDefinition).toBe(Type.ArrayDefinition);
	}

	const readonlyArr = getType<readonly number[]>();
	expect(readonlyArr.isArray()).toBeTruthy();
	if (readonlyArr.isArray())
	{
		expect(readonlyArr.getTypeArguments()[0]).toBe(Type.Number);
		expect(readonlyArr.genericTypeDefinition).toBe(Type.ReadonlyArrayDefinition);
	}

	const map = getType<Map<string, number>>();
	expect(map.isGenericType()).toBeTruthy();
	if (map.isGenericType())
	{
		expect(map.getTypeArguments()[0]).toBe(Type.String);
		expect(map.getTypeArguments()[1]).toBe(Type.Number);
		expect(map.genericTypeDefinition).toBe(Type.MapDefinition);
	}

	const weakMap = getType<WeakMap<Function, string>>();
	expect(weakMap.isGenericType()).toBeTruthy();
	if (weakMap.isGenericType())
	{
		// expect(weakMap.getTypeArguments()[0]).toBe(Type.Func); // TODO: Function? What is it?
		expect(weakMap.getTypeArguments()[1]).toBe(Type.String);
		expect(weakMap.genericTypeDefinition).toBe(Type.WeakMapDefinition);
	}
	
	const set = getType<Set<string>>();
	expect(set.isGenericType()).toBeTruthy();
	if (set.isGenericType())
	{
		expect(set.getTypeArguments()[0]).toBe(Type.String);
		expect(set.genericTypeDefinition).toBe(Type.SetDefinition);
	}

	const weakSet = getType<WeakSet<object>>();
	expect(weakSet.isGenericType()).toBeTruthy();
	if (weakSet.isGenericType())
	{
		expect(weakSet.getTypeArguments()[0]).toBe(Type.NonPrimitiveObject);
		expect(weakSet.genericTypeDefinition).toBe(Type.WeakSetDefinition);
	}

	expect(getType<Int8Array>()).toBe(Type.Int8Array);
	expect(getType<Uint8Array>()).toBe(Type.Uint8Array);
	expect(getType<Uint8ClampedArray>()).toBe(Type.Uint8ClampedArray);
	expect(getType<Int16Array>()).toBe(Type.Int16Array);
	expect(getType<Uint16Array>()).toBe(Type.Uint16Array);
	expect(getType<Int32Array>()).toBe(Type.Int32Array);
	expect(getType<Uint32Array>()).toBe(Type.Uint32Array);
	expect(getType<Float32Array>()).toBe(Type.Float32Array);
	expect(getType<Float64Array>()).toBe(Type.Float64Array);
	expect(getType<BigInt64Array>()).toBe(Type.BigInt64Array);
	expect(getType<BigUint64Array>()).toBe(Type.BigUint64Array);

	const boolPromise = getType<Promise<boolean>>();
	expect(boolPromise.isGenericType() && boolPromise.genericTypeDefinition).toBe(Type.PromiseDefinition);

	expect(getType<Symbol>()).toBe(Type.Symbol);
	expect(getType<symbol>()).toBe(Type.Symbol);
	expect(getType<Error>()).toBe(Type.Error);
	expect(getType<RegExp>()).toBe(Type.RegExp);
	const regex = /\s\S/;
	expect(getType<typeof regex>()).toBe(Type.RegExp);

	expect(getType<ArrayBuffer>()).toBe(Type.ArrayBuffer);
	expect(getType<SharedArrayBuffer>()).toBe(Type.SharedArrayBuffer);
	expect(getType<Atomics>()).toBe(Type.Atomics);
	expect(getType<DataView>()).toBe(Type.DataView);
	
	const iterable = getType<Iterable<any>>();
	expect(iterable.isGenericType()).toBeTruthy();
	if (iterable.isGenericType())
	{
		expect(iterable.getTypeArguments()[0]).toBe(Type.Any);
		expect(iterable.genericTypeDefinition).toBe(Type.IterableDefinition);
	}
	
	// expect(getType<Generator>()).toBe(Type.GeneratorDefinition);
	
	// expect(getType<IterableIterator<any>>()).toBe(Type.);
	//
	// expect(getType<AsyncIterator<any>>()).toBe(Type.);
	//
	// expect(getType<AsyncGenerator<any>>()).toBe(Type.);
	
	// expect(getType<AsyncGeneratorFunction>().toString()); // TODO: Not work!

	type Obj = { foo: string, bar: Obj };
	expect(getType<Obj>().toString());
	
	type ObjAlias = Obj;
	expect(getType<ObjAlias>().toString());
	
	expect(getType<{ foo: string, bar: number }>().toString());
});