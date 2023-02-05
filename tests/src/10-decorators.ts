import "rttist/typelib";
import {
	getType,
	MethodInfo,
	ParameterInfo,
	PropertyInfo,
	Type
} from "rttist";

let decorateType: Type = Type.Invalid;
function decorate(target: Function) {
	decorateType = getType(target);
}


let decoratePropType: PropertyInfo | undefined;
function decorateProp(targetPrototype: any, prop: string) {
	const type = getType(targetPrototype);
	decoratePropType = type.isClass() && type.getProperty(prop) || undefined;
}


let decorateMethodType: MethodInfo | undefined;
function decorateMethod(targetPrototype: any, method: string) {
	const type = getType(targetPrototype);
	decorateMethodType = type.isClass() && type.getMethod(method) || undefined;
}

let decorateParamType: ParameterInfo | undefined;
function decorateParam(targetPrototype: any, method: string, parameterIndex: number) {
	const type = getType(targetPrototype);
	const methodInfo = type.isClass() && type.getMethod(method) || undefined;
	decorateParamType = methodInfo?.getSignatures()[0].getParameters()[parameterIndex];
}

@decorate
class Foo<U extends "b" | "a" = never> {
	@decorateProp
	propName: string = "";

	@decorateMethod
	methodName(@decorateParam param: boolean): true {
		return true;
	}
}

test("class decorator", () => {
	expect(decorateType).toBe(getType(Foo));
})

test("property decorator", () => {
	expect(decoratePropType).toBeDefined();

	if (decoratePropType)
	{
		expect(decoratePropType instanceof PropertyInfo).toBeTruthy();
		expect(decoratePropType.name.name).toBe("propName");
		expect(decoratePropType.type).toBe(Type.String);
	}
})

test("method decorator", () => {
	expect(decorateMethodType).toBeDefined();

	if (decorateMethodType)
	{
		expect(decorateMethodType instanceof MethodInfo).toBeTruthy();
		expect(decorateMethodType.name.name).toBe("methodName");

		const sig = decorateMethodType.getSignatures();
		expect(sig).toHaveLength(1);
		expect(sig[0].returnType).toBe(Type.True);
	}
})

test("parameter decorator", () => {
	expect(decorateParamType).toBeDefined();
	
	if (decorateParamType)
	{
		expect(decorateParamType instanceof ParameterInfo).toBeTruthy();
		expect(decorateParamType.name).toBe("param");
		expect(decorateParamType.type).toBe(Type.Boolean);
	}
})