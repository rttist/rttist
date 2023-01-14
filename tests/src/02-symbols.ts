import {
	Type,
	PropertyInfo,
	getType,
	UnionType
} from "rttist";

const Symbol1 = Symbol.for("key");
let Symbol2 = Symbol();

class Test
{
	a!: symbol;
	b?: symbol;
	c: symbol | undefined;
	d!: symbol | boolean;
	e = Symbol1;
	f = Symbol2;
	g = Symbol();
}

test("Symbols resolved correctly", () => {
	const t: Type = getType<Test>();

	const prop: { [propName: string | number | symbol ]: PropertyInfo } = t.isClass() && t.getProperties().reduce((obj, prop) => {
		obj[prop.name.name] = prop;
		return obj;
	}, {} as { [propName: string | number | symbol ]: PropertyInfo }) || {};

	expect(t.isClass()).toBeTruthy();
	
	expect(prop.a.type.is(Type.Symbol)).toBeTruthy();

	expect(prop.b.type.is(Type.Symbol) && prop.b.type.nullable).toBeTruthy();

	// expect(prop.c.type.isUnion()).toBeTruthy();
	// expect((prop.c.type as UnionType).types.every(t => t.is(Type.Symbol) || t.is(Type.Undefined))).toBeTruthy();
	//
	// expect(prop.d.type.isUnion()).toBeTruthy();
	// expect((prop.d.type as UnionType).types.every(t => t.is(Type.Symbol) || t.is(Type.Boolean))).toBeTruthy();

	expect(prop.e.type.id).toBe(Type.Symbol.id);
	expect(prop.f.type.id).toBe(Type.Symbol.id);
	expect(prop.g.type.id).toBe(Type.Symbol.id);
});