import type { MetadataLibrary, MetadataContextHelpers } from "rttist";

// /**
//  * Returns Type object for passed generic type parameter or function parameter.
//  * @param [args] Optional parameter for cases when you want to get Type object from runtime value.
//  * Always use generic type parameter if you can statically access the type.
//  * Use this runtime function argument only if you have no other option.
//  * It is reliable only for classes, functions and primitives (such as undefined, true, false, numbers, strings).
//  * @example
//  * getType<MyInterface>() // returns Type object for `MyInterface` interface.
//  * getType<MyClass>() // returns Type object for `MyClass` class.
//  * getType(MyClass) // returns Type object for `MyClass` class; at runtime
//  * getType(someClassCtor) // returns Type object corresponding to class stored in `someClassCtor` variable; at runtime
//  */
// export declare function getType<T>(...args: any[]): Type;
//
// /**
//  * Returns a Type instance identified by the reference. Returns Type.Invalid if no Type found.
//  * @param id
//  */
// export declare function resolveType(id: TypeReference): Type;

export declare const getType: MetadataLibrary["getType"];
export declare const resolveType: MetadataLibrary["resolveType"];
export declare const _: MetadataContextHelpers;

/** @internal */
export declare const Metadata: MetadataLibrary;
