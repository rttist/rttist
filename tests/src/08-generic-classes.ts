import { Type, getType } from "rttist";

class A<TNumber extends number | bigint> {
	private readonly classTypeParam: Type;
	
	constructor()
	{
		this.classTypeParam = Reflect.getType<TNumber>();
	}

	test<T>() {
		return [this.classTypeParam, getType<TNumber>(), getType<T>()];
	}
}

test("generic classes - `new` operator", () => {
	const a = new A<number>();
	const [
		classTypeArg,
		classTypeArg2,
		methodTypeArg
	] = a.test<boolean>();
	
	expect(classTypeArg instanceof Type).toBeTruthy();
	expect(classTypeArg == Type.Invalid).toBeFalsy();
	expect(classTypeArg.is(Type.Number)).toBeTruthy();
	expect(classTypeArg.is<number>()).toBeTruthy();
	
	expect(classTypeArg2 instanceof Type).toBeTruthy();
	expect(classTypeArg2 == Type.Invalid).toBeFalsy();
	expect(classTypeArg2.is(Type.Number)).toBeTruthy();
	expect(classTypeArg2.is<number>()).toBeTruthy();
	
	expect(methodTypeArg instanceof Type).toBeTruthy();
	expect(methodTypeArg == Type.Invalid).toBeFalsy();
	expect(methodTypeArg.is(Type.Boolean)).toBeTruthy();
	expect(methodTypeArg.is<boolean>()).toBeTruthy();
});

test("generic classes - `new` operator - aliased ctor", () => {
	const ANumber: typeof A<number> = A;
	const a = new ANumber();
	const [
		classTypeArg,
		classTypeArg2,
		methodTypeArg
	] = a.test<boolean>();

	expect(classTypeArg instanceof Type).toBeTruthy();
	expect(classTypeArg == Type.Invalid).toBeFalsy();
	expect(classTypeArg.is(Type.Number)).toBeTruthy();
	expect(classTypeArg.is<number>()).toBeTruthy();

	expect(classTypeArg2 instanceof Type).toBeTruthy();
	expect(classTypeArg2 == Type.Invalid).toBeFalsy();
	expect(classTypeArg2.is(Type.Number)).toBeTruthy();
	expect(classTypeArg2.is<number>()).toBeTruthy();

	expect(methodTypeArg instanceof Type).toBeTruthy();
	expect(methodTypeArg == Type.Invalid).toBeFalsy();
	expect(methodTypeArg.is(Type.Boolean)).toBeTruthy();
	expect(methodTypeArg.is<boolean>()).toBeTruthy();
});

test("generic classes - `Reflect.construct<>()`", () => {
	const a = Reflect.construct<A<number>>(A, []);
	const [
		classTypeArg,
		classTypeArg2,
		methodTypeArg
	] = a.test<boolean>();

	expect(classTypeArg instanceof Type).toBeTruthy();
	expect(classTypeArg == Type.Invalid).toBeFalsy();
	expect(classTypeArg.is(Type.Number)).toBeTruthy();
	expect(classTypeArg.is<number>()).toBeTruthy();

	expect(classTypeArg2 instanceof Type).toBeTruthy();
	expect(classTypeArg2 == Type.Invalid).toBeFalsy();
	expect(classTypeArg2.is(Type.Number)).toBeTruthy();
	expect(classTypeArg2.is<number>()).toBeTruthy();

	expect(methodTypeArg instanceof Type).toBeTruthy();
	expect(methodTypeArg == Type.Invalid).toBeFalsy();
	expect(methodTypeArg.is(Type.Boolean)).toBeTruthy();
	expect(methodTypeArg.is<boolean>()).toBeTruthy();
});

test("generic classes - manually calling `Reflect.constructGeneric()`", () => {
	const a = Reflect.constructGeneric(A, [Type.Number], []);
	const [
		classTypeArg,
		classTypeArg2,
		methodTypeArg
	] = a.test<boolean>();

	expect(classTypeArg instanceof Type).toBeTruthy();
	expect(classTypeArg == Type.Invalid).toBeFalsy();
	expect(classTypeArg.is(Type.Number)).toBeTruthy();
	expect(classTypeArg.is<number>()).toBeTruthy();

	expect(classTypeArg2 instanceof Type).toBeTruthy();
	expect(classTypeArg2 == Type.Invalid).toBeFalsy();
	expect(classTypeArg2.is(Type.Number)).toBeTruthy();
	expect(classTypeArg2.is<number>()).toBeTruthy();

	expect(methodTypeArg instanceof Type).toBeTruthy();
	expect(methodTypeArg == Type.Invalid).toBeFalsy();
	expect(methodTypeArg.is(Type.Boolean)).toBeTruthy();
	expect(methodTypeArg.is<boolean>()).toBeTruthy();
});

test("generic classes - instanceof", () => {
	const a = new A<number>();
	const b = new A();
	
	const ANumberCtor = new A<number>().constructor;
	const ABigIntCtor = new A<bigint>().constructor;
	const ANumberCtor2 = Rttist.getGenericClass(A, Type.Number);


	expect(a instanceof A).toBeTruthy();
	expect(a instanceof a.constructor).toBeTruthy();
	expect(a instanceof ANumberCtor).toBeTruthy();
	expect(a instanceof ANumberCtor2).toBeTruthy();
	expect( a instanceof ABigIntCtor).toBeFalsy();

	expect(b instanceof A).toBeTruthy();
	expect(b instanceof a.constructor).toBeFalsy();
});

test("generic classes - Type.is", () => {
	const ANumberType = getType<A<number>>();
	expect(ANumberType.is<A<number>>()).toBeTruthy();
});