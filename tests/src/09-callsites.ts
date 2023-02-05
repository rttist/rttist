import "rttist/typelib";
import {
	getType,
	Type
} from "rttist";

function fn1<TType>()
{
	return getType<TType>();
}

const fn2 = function <TType>(t: TType) {
	return fn1<TType>();
};

const fn3 = function <TType>(t: TType) {
	return fn2(t);
};

test("Callsite passed through functions", () => {
	const t1 = fn1<number>();
	expect(t1).toBe(Type.Number);

	const t2 = fn2(5);
	expect(t2.isLiteral()).toBeTruthy();
	expect(t2.isLiteral() && t2.isNumberLiteral() && t2.value).toBe(5);

	const t3 = fn3("foo");
	expect(t3.isLiteral() && t3.isStringLiteral() && t3.value).toBe("foo");
});

const obj = {
	fn1: function <T>() {
		return fn1<T>();
	},
	fn2: function <T>(t: T) {
		return fn2(t);
	},
	fn3: function <T>(t: T) {
		return this.fn2(t);
	}
};

test("Callsite passed through object methods", () => {
	const t1 = obj.fn1<number>();
	expect(t1).toBe(Type.Number);

	const t2 = obj.fn2(5);
	expect(t2.isLiteral()).toBeTruthy();
	expect(t2.isLiteral() && t2.isNumberLiteral() && t2.value).toBe(5);

	const t3 = obj.fn3("foo");
	expect(t3.isLiteral() && t3.isStringLiteral() && t3.value).toBe("foo");
});

class Cls
{
	fn1<T>()
	{
		return fn1<T>();
	}

	fn2<T>(t: T)
	{
		return fn2(t);
	}

	fn3<T>(t: T)
	{
		return this.fn2(t);
	}
}

test("Callsite passed through class methods", () => {
	const obj = new Cls();

	const t1 = obj.fn1<number>();
	expect(t1).toBe(Type.Number);

	const t2 = obj.fn2(5);
	expect(t2.isLiteral()).toBeTruthy();
	expect(t2.isLiteral() && t2.isNumberLiteral() && t2.value).toBe(5);
	
	const t3 = obj.fn3("foo");
	expect(t3.isLiteral() && t3.isStringLiteral() && t3.value).toBe("foo");
});

