import {
	AccessModifier,
	Accessor,
	ClassType,
	getType,
	Type,
	TypeKind
} from "rttist";

export class Something
{
	property: string = "";
	optionalProperty?: string;
	readonly readOnlyProperty: string = "";

	get getter(): string
	{
		return "";
	}

	set setter(val: string)
	{
	}


	constructor()
	constructor(property: string)
	constructor(property?: string)
	{
		if (property)
		{
			this.property = property;
		}
	}

	method(): string
	{
		return "";
	}

	optionalMethod?(): string;
	
	twoSignaturesMethod(str: string): string
	twoSignaturesMethod(num: number): string
	twoSignaturesMethod(strOrNum: string | number): string {
		return strOrNum.toString();
	}
}

class ISomething {}

class SomethingChild extends Something implements ISomething {
	
}

const type = getType<Something>() as ClassType;
const properties = type.getProperties();
const methods = type.getMethods();

test("Type of class is correct", () => {
	expect(type instanceof Type).toBe(true);
	expect(type.name).toBe("Something");
	expect(type.kind).toBe(TypeKind.Class);
	expect(type.isClass()).toBe(true);
	
	const childType = getType<SomethingChild>() as ClassType;
	expect(childType.isClass()).toBe(true);
	expect(childType.extends).toBe(type);
	expect(childType.implements).toHaveLength(1);
	expect(childType.implements[0]).toBe(getType<ISomething>());
});

test("Type of class has all the members", () => {
	expect(properties).toHaveLength(5);
	expect(methods).toHaveLength(3);
});

test("Class constructors", () => {
	const ctors = type.getConstructors()!;

	expect(ctors).toBeDefined();
	expect(ctors).toHaveLength(2);
	expect(ctors[0].getParameters()).toHaveLength(0);
	expect(ctors[1].getParameters()).toHaveLength(1);
	expect(ctors[1].getParameters()[0].name).toBe("property");
});

test("Regular class property", () => {
	const prop = properties.find(prop => prop.name.name === "property")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Optional class property", () => {
	const prop = properties.find(prop => prop.name.name === "optionalProperty")!;

	expect(prop).not.toBeUndefined();
	// TODO: Solve optional types
	// expect(prop.type.isUnion()).toBe(true);
	// expect(prop.type.types).toBeDefined();
	// expect(prop.type.types).toContain(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(true);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Readonly class property", () => {
	const prop = properties.find(prop => prop.name.name === "readOnlyProperty")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(true);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.None);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Getter class property", () => {
	const prop = properties.find(prop => prop.name.name === "getter")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(true);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.Getter);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Setter class property", () => {
	const prop = properties.find(prop => prop.name.name === "setter")!;

	expect(prop).not.toBeUndefined();
	expect(prop.type).toBe(Type.String);
	expect(prop.readonly).toBe(false);
	expect(prop.accessModifier).toBe(AccessModifier.Public);
	expect(prop.accessor).toBe(Accessor.Setter);
	expect(prop.optional).toBe(false);
	expect(prop.getDecorators()).toHaveLength(0);
});

test("Regular class method", () => {
	const method = methods.find(prop => prop.name.name === "method")!;

	expect(method).not.toBeUndefined();
	expect(method.accessModifier).toBe(AccessModifier.Public);
	expect(method.optional).toBe(false);
	expect(method.getDecorators()).toHaveLength(0);
	
	const signatures = method.getSignatures();
	expect(signatures).toHaveLength(1);
	expect(signatures[0].returnType).toBe(Type.String);
});

test("Multiple signatures", () => {
	const method = methods.find(prop => prop.name.name === "twoSignaturesMethod")!;
	const signatures = method.getSignatures();
	
	expect(signatures).toHaveLength(2);
	
	expect(signatures[0].getParameters()[0].type).toBe(Type.String);
	expect(signatures[1].getParameters()[0].type).toBe(Type.Number);
});

test("Optional class method", () => {
	const method = methods.find(prop => prop.name.name === "optionalMethod")!;

	expect(method).not.toBeUndefined();
	expect(method.accessModifier).toBe(AccessModifier.Public);
	expect(method.optional).toBe(true);
	expect(method.getDecorators()).toHaveLength(0);

	const signatures = method.getSignatures();
	expect(signatures).toHaveLength(1);
	expect(signatures[0].returnType).toBe(Type.String);
});

test("sub-class", () => {
	// TODO: Write tests 
	expect(true).toBeTruthy();
});

test("Generic class", () => {
	// TODO: Write tests 
	expect(true).toBeTruthy();

	class User
	{
	}

	class Logger<TContext>
	{

	}

	const logger = new Logger<User>();

	// Breaking behavior - it has own constructor
	expect(Object.getPrototypeOf(logger).constructor).not.toBe(Logger);

	// Keeps behavior
	expect(logger).toBeInstanceOf(Logger);

	const userLoggerType: Type = getType<Logger<User>>();
	const loggerType: Type = getType(Logger);

	expect(userLoggerType.isClass()).toBeTruthy();

	if (userLoggerType.isClass())
	{
		expect(userLoggerType.isSubclassOf(loggerType)).toBeTruthy();
		expect(userLoggerType.isGenericType()).toBeTruthy();

		if (userLoggerType.isGenericType())
		{
			expect(userLoggerType.genericTypeDefinition).toBe(loggerType);
			expect(userLoggerType.genericTypeDefinition.isGenericType()).toBeTruthy();
			expect(userLoggerType.genericTypeDefinition.isGenericTypeDefinition()).toBeTruthy();
		}
	}
});