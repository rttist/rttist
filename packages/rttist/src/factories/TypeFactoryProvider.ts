import type { GenericTypeFactory } from "./GenericTypeFactory";
import type { TypeFactory } from "./TypeFactory";

let typeFactory = null as any;

export function setTypeFactory(factory: typeof TypeFactory) {
	typeFactory = factory;
}

export function getTypeFactory(): typeof TypeFactory {
	if (!typeFactory) {
		throw new Error("Type factory is not set");
	}
	return typeFactory;
}

let genericTypeFactory = null as any;

export function setGenericTypeFactory(factory: typeof GenericTypeFactory) {
	genericTypeFactory = factory;
}

export function getGenericTypeFactory(): typeof GenericTypeFactory {
	if (!genericTypeFactory) {
		throw new Error("Type factory is not set");
	}
	return genericTypeFactory;
}
