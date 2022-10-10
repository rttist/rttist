import {
	Type,
	PropertyInfo
} from "@rttist/abstract";

const Symbol1 = Symbol();
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
	const t: Type = Reflect.getType<Test>();
	const prop: Record<string, PropertyInfo> = t.isClass() && t.getProperties().reduce((obj, prop) => {
		obj[prop.name] = prop;
		return obj;
	}, {} as Record<string, PropertyInfo>) || {};

	expect(t.isClass()).toBeTruthy();
	expect(prop.a.type.is(Type.Symbol)).toBeTruthy();
	expect(prop.b.type.isUnion() && prop.b.type.types.every(t => t.is(Type.Symbol) || t.is(Type.Undefined))).toBeTruthy();
	expect(prop.c.type.isUnion() && prop.c.type.types.every(t => t.is(Type.Symbol) || t.is(Type.Undefined))).toBeTruthy();
	expect(prop.d.type.isUnion() && prop.d.type.types.every(t => t.is(Type.Symbol) || t.is(Type.Boolean))).toBeTruthy();
	expect(prop.e.type.is(Type.Symbol)).toBeTruthy();
	expect(prop.f.type.is(Type.Symbol)).toBeTruthy();
	expect(prop.g.type.is(Type.Symbol)).toBeTruthy();
});