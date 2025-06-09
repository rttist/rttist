// import type { TypeReference } from "../declarations";
// import type { MetadataContextHelpers } from "../metadata-context-helpers";
// import { Type } from "../Type";
// import { MetadataScope } from "../metadata-scope";
// import { getGenericClass } from "./getGenericClass";
// import { PROTOTYPE_TYPE_PROPERTY } from "@rttist/core";
//
// export function constructGeneric<TType = any>(
// 	target: Function,
// 	typeParameters: Array<Type | TypeReference>,
// 	argumentsList: ArrayLike<any>,
// 	newTarget?: Function,
// 	helpers?: MetadataContextHelpers
// ): TType {
// 	const Class = (helpers?.getGC$ || getGenericClass)(
// 		target as { new (...args: any[]): unknown },
// 		...typeParameters.map((tpReference) =>
// 			tpReference instanceof Type ? tpReference : (helpers?.rt$ || MetadataScope.current.resolveType)(tpReference)
// 		)
// 	);
//
// 	if (newTarget !== undefined) {
// 		newTarget = inheritNewTarget(newTarget, Class);
// 	}
//
// 	return Reflect.construct(Class, argumentsList, newTarget ?? Class);
// }
//
// function inheritNewTarget(newTarget: Function, Class: Function) {
// 	const name = newTarget.name !== undefined ? `${newTarget.name}{}` : Class.name;
// 	const inheritedNewTarget = {
// 		[name]: class {},
// 	}[name];
//
// 	Object.setPrototypeOf(inheritedNewTarget.prototype, newTarget.prototype);
//
// 	(inheritedNewTarget.prototype as any)[PROTOTYPE_TYPE_PROPERTY] = Class.prototype[PROTOTYPE_TYPE_PROPERTY];
//
// 	return inheritedNewTarget;
// }
