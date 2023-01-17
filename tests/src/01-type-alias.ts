import { getType } from "rttist";

class Test
{
	a!: symbol;
	b?: symbol;
	c: symbol | undefined;
	d!: symbol | boolean;
	g = Symbol();
}

type TestAlias = Test;

test("Type alias of class", () => {
	const testAliasType = getType<TestAlias>();

	expect(testAliasType.isTypeAlias()).toBeTruthy();

	if (testAliasType.isTypeAlias())
	{
		expect(testAliasType.name).toBe("TestAlias");
		expect(testAliasType.target).toBe(getType<Test>());
	}
});

type Type2 = { foo: string };
type TestAlias2 = Type2;

test("Type alias of object type literal", () => {
	const testAliasType = getType<TestAlias2>();

	expect(testAliasType.isTypeAlias()).toBeTruthy();

	if (testAliasType.isTypeAlias())
	{
		expect(testAliasType.name).toBe("TestAlias2");
		expect(testAliasType.target).toBe(getType<Type2>());
	}
});