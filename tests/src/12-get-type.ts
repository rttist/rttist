import "rttist/typelib";
import { getType } from "rttist";

function fn1()
{
}

async function asyncFn1()
{
}

class Class1
{
}


test("Get type of function from runtime value", () => {
	const type = getType(fn1);

	expect(type.isFunction()).toBeTruthy();
	expect(type.name).toBe("fn1");
});

test("Get type of async function from runtime value", () => {
	const type = getType(asyncFn1);

	expect(type.isFunction()).toBeTruthy();
	expect(type.name).toBe("asyncFn1");
});

test("Get type of function from class value", () => {
	const type = getType(Class1);

	expect(type.isClass()).toBeTruthy();
	expect(type.name).toBe("Class1");
});