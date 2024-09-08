import { getType, Metadata } from "./metadata.typelib";
import { ClassType, PropertyInfo, SignatureInfo, Type, TypeParameterType } from "rttist";
import "./nesting/nested-file";

export type Union = { fooBar: string } | { barFoo: number };
const unionType = getType<Union>();
console.log(unionType.isTypeAlias() && unionType.target.toString());

export type Intersection = { fooBar: string } & { barFoo: number };
const intersectionType = getType<Intersection>();
console.log(intersectionType.isTypeAlias() && intersectionType.target.toString());

type NonObjectTypeLiteralAlias = ["foo"];
const nonObjectTypeLiteralAliasType = getType<NonObjectTypeLiteralAlias>();
console.log(nonObjectTypeLiteralAliasType.isTypeAlias() && nonObjectTypeLiteralAliasType.target.toString());
console.log("isTuple", nonObjectTypeLiteralAliasType.isTypeAlias() && nonObjectTypeLiteralAliasType.target.isTuple());
console.log(
	nonObjectTypeLiteralAliasType.isTypeAlias() &&
		nonObjectTypeLiteralAliasType.target.isTuple() &&
		nonObjectTypeLiteralAliasType.target.getTypeArguments().map((arg) => arg.toString())
);

type StringArray = string[];
const stringArrayType = getType<StringArray>();
console.log(stringArrayType.isTypeAlias() && stringArrayType.target.toString());

type TypeLiteralAlias = {
	foo: string;
	bar: number;
};
const typeLiteralAliasType = getType<TypeLiteralAlias>();
console.log(typeLiteralAliasType.isTypeAlias() && typeLiteralAliasType.target.toString());

export class Foo {
	bar: string;
	baz: number;

	constructor(bar: string, baz: number) {
		this.bar = bar;
		this.baz = baz;
	}
}

console.log(getType(Foo).toString());

const foo = new Foo("", 5);

console.log(foo);
console.log(getType<Foo>().id);
console.log(getType(Foo).id);

console.log("string:", getType<string>().is(Type.String));
console.log("number:", getType<number>().is(Type.Number));

const trueType = getType<true>();
console.log("true literal:", trueType.is(Type.True), trueType.isLiteral() && trueType.isTrue());

const bigIntLitType = getType<5n>();
console.log("BigInt literal:", bigIntLitType.isLiteral() && bigIntLitType.isBigIntLiteral());

const stringLitType = getType<"Some string">();
console.log("String literal:", stringLitType.isLiteral() && stringLitType.isStringLiteral());

function someFunc<T>(param1: T, param2: string): Array<number> {
	return [~~param1, Number(param2)];
}

const someFuncType = getType(someFunc);

const signatures: readonly SignatureInfo[] = someFuncType.isFunction() ? someFuncType.getSignatures() : [];
console.log("Signatures of,", someFuncType.name);
for (let signature of signatures) {
	const tps: ReadonlyArray<TypeParameterType> = signature.getTypeParameters();
	const typeParams = tps.length ? `<${tps.map((tp) => tp.name)}>` : "";

	console.log(
		`\t${typeParams}(${signature
			.getParameters()
			.map((p) => `${p.name}: ${p.type.name}`)
			.join(", ")}): ${signature.returnType.name}`
	);
}

class Bar<T> {
	f1?: Array<string>;
	f2?: Promise<string>;
	f3?: ReadonlyArray<string>;
	f4?: Set<string>;
	f5?: WeakSet<object>;
	f6?: Map<string, number>;
	f7?: WeakMap<object, number>;

	constructor(public readonly value: T) {}

	foo<U>(u: U): [x: T, y: U] {
		return [this.value, u];
	}
}

const barType = getType(Bar) as ClassType;
console.log("Bar properties types:", ...barType.getProperties().map((prop: PropertyInfo) => prop.type.name));
console.log("Bar.foo return type:", barType.getMethod("foo")?.getSignatures()[0].returnType.name);

/**@ts-ignore*/
const barType2 = getType<Bar>() as ClassType;
console.log(
	"barType == barType2",
	barType == barType2,
	"is generic type definition:",
	barType2.isGenericTypeDefinition()
);

const stringBarType = getType<Bar<string>>();
console.log(
	"stringBarType",
	stringBarType.id,
	stringBarType.name,
	"isGenericType",
	stringBarType.isGenericType(),
	"isGenericTypeDefinition",
	stringBarType.isGenericTypeDefinition(),
	"stringBarType.genericTypeDefinition == type of Bar",
	stringBarType.isGenericType() && stringBarType.genericTypeDefinition == barType
);

class StringBar extends Bar<string> {}

/**@ts-ignore*/
console.log(getType<Array>().name, getType<Array>() == getType<Array>(), getType<Array>().isGenericTypeDefinition());
/**@ts-ignore*/
console.log(getType<Promise>().name);

console.log(getType<Array<string>>().name);
console.log(getType<Promise<string>>().name);
console.log(getType<ReadonlyArray<string>>().name);
console.log(getType<Set<string>>().name);
console.log(getType<WeakSet<object>>().name);
console.log(getType<Map<string, number>>().name);
console.log(getType<WeakMap<object, number>>().name);
