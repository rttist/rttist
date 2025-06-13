import type { ModuleIdentifier, TypeIdentifier } from "./declarations";
import type { TypeKind } from "./enums";
import type { Module } from "./Module";
import type { Type } from "./Type";
import type { ClassType, FunctionType, InterfaceType, ObjectType, TypeAliasType } from "./types";

export type TypedType<
	TId extends TypeIdentifier = TypeIdentifier,
	TKind extends TypeKind = TypeKind,
	TName extends string = string,
	// TModule extends TypedModule | Module = Module,
> = {
	/**
	 * Type identifier.
	 */
	get id(): TId;

	/**
	 * Kind of the type.
	 */
	get kind(): TKind;

	/**
	 * Name of the type.
	 */
	get name(): TName;
};

type TypedTypeWithModule<TType extends TypedType, TModule extends TypedModule> = TType & {
	/**
	 * Module which declare type represented by this Type instance.
	 */
	get module(): TModule;
};

export interface TypedModule<
	TId extends ModuleIdentifier = ModuleIdentifier,
	TName extends string = string,
	TPath extends string = string,
	TTypes extends TypedType[] = TypedType[],
> {
	/**
	 * The name of the module.
	 * @description It is filename of the module in the most of the cases.
	 */
	readonly name: TName;

	/**
	 * The path of the module.
	 */
	readonly path: TPath;

	/**
	 * Module identifier.
	 */
	get id(): TId;

	/**
	 * Returns array of types from the module.
	 */
	getTypes(): TTypes;

	/**
	 * Imports module and returns exported object.
	 */
	import(): Promise<undefined | { [exportName: string]: any }>;
}

type TypedModuleWithChildren<TTypedModule extends TypedModule, TChildren> = TTypedModule & {
	/**
	 * Returns array of modules required by this Module.
	 * @description These are all the imported modules.
	 */
	getChildren(): TChildren;
};

export type TypedModuleMap<TModules extends TypedModule[]> = {
	[TModule in TModules[number] as TModule["id"]]: TModule;
};

export type TypedTypeMap<TTypes extends TypedType[]> = {
	[TType in TTypes[number] as TType["id"]]: TType;
};

type TypesOfModules<TModules extends TypedModule[]> = {
	[TModuleId in keyof TypedModuleMap<TModules>]: TModuleId extends TypedModule<any, any, any, infer TTypes>
		? TTypes
		: never;
};

// type TypesOfModules<TModules extends TypedModule[]> = {
// 	[TModuleId in keyof TypedModuleMap<TModules>]: TModuleId extends TypedModule<any, any, any, infer TTypes>
// 		? TTypes
// 		: never;
// };

type UnionTypesOfModules<TModules extends TypedModule[]> = TypesOfModules<TModules>[string];

export type TypedTypelib<TModules extends TypedModule[]> = {
	/**
	 * Returns all the Types contained in the Metadata.
	 */
	getTypes(): Array<UnionTypesOfModules<TModules>>;

	/**
	 * Returns all Modules contained in the library.
	 */
	getModules(): TModules;

	// getType<TType>(): UnionTypesOfModules<TModules>[TType];
};

// type TypedModuleMetadata = Omit<TypedModule, "getChildren"> ;

type SelectItem<TObj, TKey> = TKey extends keyof TObj ? TObj[TKey] : never;

// type f = SelectItem<>;

// Enrich TypedModule from TModules with getChildren method based on id mapping from TModulesChildren
type WithChildren<TModules extends TypedModule[], TModulesChildren extends Record<string, string[]>> = {
	[TModuleIndex in keyof TModules]: TypedModuleWithChildren<
		TModules[TModuleIndex],
		{
			[TChildIndex in keyof TModulesChildren[TModules[TModuleIndex]["id"]]]: SelectItem<
				TypedModuleMap<TModules>,
				TModulesChildren[TModules[TModuleIndex]["id"]][TChildIndex]
			>;
		}
	>;

	// [TModuleIndex in keyof TModules]: TModules[TModuleIndex] & {
	// 	getChildren(): {
	// 		[TChildIndex in keyof TModulesChildren[TModules[TModuleIndex]["id"]]]: SelectItem<
	// 			TypedModuleMap<TModules>,
	// 			TModulesChildren[TModules[TModuleIndex]["id"]][TChildIndex]
	// 		>;
	// 		// [TChildIndex in keyof TModulesChildren[TModules[TModuleIndex]["id"]]]: TypedModuleMap<TModules>[TModulesChildren[TModules[TModuleIndex]["id"]][TChildIndex]];
	//
	// 		// [TChildIndex in keyof TModulesChildren[TModules[TModuleIndex]["id"]]]: TypedModuleMap<TModules>[TModulesChildren[TModules[TModuleIndex]["id"]][Extract<
	// 		// 	TypedModuleMap<TModules>,
	// 		// 	TChildIndex
	// 		// >]];
	//
	// 		// [TChildId in TModulesChildren[TModules[TModuleIndex]["id"]][number]]: TypedModuleMap<TModules>[TChildId];
	// 	};
	//
	// 	// 	TypedModuleMap<
	// 	// 	{
	// 	// 		[TChildId in TModulesChildren[TModules[TModuleIndex]["id"]][number]]: TypedModuleMap<TModules>[TChildId];
	// 	// 	}[keyof TModulesChildren[TModules[TModuleIndex]["id"]]]
	// 	// >
	// };
};

////////////
// typelib.d.ts

type Modules = [
	TypedModule<
		"@@@this/index",
		"index",
		"/home/test/index.ts",
		[
			TypedType<"@@@this/index:exampleFunction", TypeKind.Function, "exampleFunction">,
			TypedType<"@@@this/index:ExampleClass", TypeKind.Class, "ExampleClass">,
		]
	>,
	TypedModule<"@@@this/another", "another", "/home/test/another.ts", []>,
];

export type Typelib = TypedTypelib<
	WithChildren<
		Modules,
		{
			"@@@this/index": ["@@@this/another"];
			"@@@this/another": [];
		}
	>
>;

// type TypeByTypeKind<TKind extends TypeKind> = ;

type TypeKindMap =
	| {
			kind: TypeKind.Object;
			tsType: ObjectType;
	  }
	| {
			kind: TypeKind.Function;
			tsType: FunctionType;
	  }
	| {
			kind: TypeKind.Class;
			tsType: ClassType;
	  }
	| {
			kind: TypeKind.Interface;
			tsType: InterfaceType;
	  };
// | {
// 		kind: TypeKind.String;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Number;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Boolean;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.BigInt;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Date;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Null;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Undefined;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Never;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Void;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Any;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.True;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.False;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Symbol;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.Error;
// 		tsType: InterfaceType;
//   }
// | {
// 		kind: TypeKind.RegExp;
// 		tsType: InterfaceType;
//   };

type TypeMap =
	| {
			tsType: typeof exampleFunction;
			typedType: TypedType<"@@@this/index:exampleFunction", TypeKind.Function, "exampleFunction">;
	  }
	| {
			tsType: ExampleClass;
			typedType: TypedType<"@@@this/index:ExampleClass", TypeKind.Class, "ExampleClass">;
	  };

declare function getType<TType>():
	| (Extract<TypeMap, { tsType: TType }>["typedType"] &
			Omit<
				Extract<TypeKindMap, { kind: Extract<TypeMap, { tsType: TType }>["typedType"]["kind"] }>["tsType"],
				"id" | "name" | "kind"
			>)
	| TypeAliasType;

///////////////
// Source code

function exampleFunction() {}
class ExampleClass {}

const functionType = getType<typeof exampleFunction>();

// functionType.

const typelib: Typelib = null as any;
// const firstType = typelib.getTypes()[0];
// firstType.

const module = typelib.getModules()[0];
const child = module.getChildren()[0];
const childId = child.id;

// module.getTypes()[0].

//
const type = module.getTypes()[0];
const typeId = type.id;
// type.mo

// type exampleFunctionType = Extract<TypeMap, { tsType: typeof exampleFunction }>["typedType"];
// const t: exampleFunctionType = null as any;

// const name = t.name;
