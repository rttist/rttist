// import "./metadata.typelib.js";

class Test
{
	a!: symbol;
	b?: symbol;
	c: symbol | undefined;
	d!: symbol | boolean;
	g = Symbol();
}

type TestAlias = Test;

test("Type alias", () => {
	Reflect.getType<TestAlias>();
});