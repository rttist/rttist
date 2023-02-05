import "rttist/typelib";
import {
	AccessModifier,
	Accessor,
	getType,
	InterfaceType,
	PropertyInfo,
	Type,
	TypeKind
} from "rttist";

interface ISomething
{
	property: string;
	optionalProperty?: string;
	readonly readOnlyProperty: string;

	get getter(): string;

	set setter(val: string);

	method(): string;

	optionalMethod?(): string;
}

interface ISomething2 extends ISomething
{
	property2: string;
}

const type = getType<ISomething>() as InterfaceType;
const properties = (type as InterfaceType).getProperties();
const methods = (type as InterfaceType).getMethods();

test("Type of interface is interface type", () => {
	expect(type.isInterface()).toBeTruthy();
});

test("Type of interface is correct", () => {
	expect(type instanceof Type).toBe(true);
	expect(type).not.toBe(Type.Unknown);
	expect(type.name).toBe("ISomething");
	expect(type.kind).toBe(TypeKind.Interface);
	expect(type.isInterface()).toBe(true);
	expect(type.extends).toHaveLength(0);
});

test("Interface Extends", () => {
	const type2 = getType<ISomething2>() as InterfaceType;
	expect(type2.extends).toHaveLength(1);
	expect(type2.extends[0]).toBe(type);
});

test("Type of interface has all the members", () => {
	expect(properties).toHaveLength(5);
	expect(methods).toHaveLength(2);
});

test("Regular interface property", () => {
	const prop = properties.find(prop => prop.name.name === "property")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Optional interface property", () => {
	const prop: PropertyInfo = properties.find(prop => prop.name.name === "optionalProperty")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.type.nullable).toBe(true); // TODO: Nullable types
	expect(prop.optional).toBeTruthy();

	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(true);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Readonly interface property", () => {
	const prop = properties.find(prop => prop.name.name === "readOnlyProperty")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(true);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Getter interface property", () => {
	const prop = properties.find(prop => prop.name.name === "getter")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(true);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.Getter);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Setter interface property", () => {
	const prop = properties.find(prop => prop.name.name === "setter")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.Setter);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Regular interface method", () => {
	const method = methods.find(method => method.name.name === "method")!;

	expect(method.accessModifier).toBe(AccessModifier.Public);
	expect(method.optional).toBe(false);
	expect(method.getDecorators()).toHaveLength(0);

	const signature = method.getSignatures()[0];

	expect(signature).not.toBeUndefined();
	expect(signature.returnType).toBe(Type.String);
});

test("Optional interface method", () => {
	const method = methods.find(method => method.name.isString() && method.name.name === "optionalMethod")!;

	expect(method.accessModifier).toBe(AccessModifier.Public);
	expect(method.optional).toBe(true);
	expect(method.getDecorators()).toHaveLength(0);

	const signature = method.getSignatures()[0];

	expect(signature).not.toBeUndefined();
	expect(signature.returnType).toBe(Type.String);
});