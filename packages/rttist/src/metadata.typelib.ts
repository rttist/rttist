/*
* This file is generated automatically by the RTTIST TypeGen tool.
* Do not edit it manually.
*/
import { ModuleImporter, MetadataLibrary, createGetTypeFunction, createCallsite, resolveFromFunctionCallsite, resolveFromMethodCallsite, getClassTypeParameter, Type } from "rttist";


// @ts-ignore; !! CONFIGURE THIS AS AN EXTERNAL DEPENDENCY !!
import { Metadata as InternalMetadataLibrary } from "./internal.typelib";

ModuleImporter.registerImporters({
	"@rttist/Type": () => import("./Type.js"),
	"@rttist/Module": () => import("./Module.js"),
	"@rttist/types/ClassType": () => import("./types/ClassType.js"),
	"@rttist/types/ConditionalType": () => import("./types/ConditionalType.js"),
	"@rttist/types/EnumLiteralType": () => import("./types/EnumLiteralType.js"),
	"@rttist/types/EnumType": () => import("./types/EnumType.js"),
	"@rttist/types/ESSymbolType": () => import("./types/ESSymbolType.js"),
	"@rttist/types/FunctionType": () => import("./types/FunctionType.js"),
	"@rttist/types/GeneratorFunctionType": () => import("./types/GeneratorFunctionType.js"),
	"@rttist/types/GenericType": () => import("./types/GenericType.js"),
	"@rttist/types/index": () => import("./types/index.js"),
	"@rttist/types/IndexedAccessType": () => import("./types/IndexedAccessType.js"),
	"@rttist/types/InterfaceType": () => import("./types/InterfaceType.js"),
	"@rttist/types/IntersectionType": () => import("./types/IntersectionType.js"),
	"@rttist/types/KnownGenericType": () => import("./types/KnownGenericType.js"),
	"@rttist/types/LiteralType": () => import("./types/LiteralType.js"),
	"@rttist/types/MemberName": () => import("./types/MemberName.js"),
	"@rttist/types/ModuleType": () => import("./types/ModuleType.js"),
	"@rttist/types/NamespaceType": () => import("./types/NamespaceType.js"),
	"@rttist/types/NativeKnownTypes": () => import("./types/NativeKnownTypes.js"),
	"@rttist/types/ObjectLikeTypeBase": () => import("./types/ObjectLikeTypeBase.js"),
	"@rttist/types/ObjectType": () => import("./types/ObjectType.js"),
	"@rttist/types/TemplateType": () => import("./types/TemplateType.js"),
	"@rttist/types/TypeAliasType": () => import("./types/TypeAliasType.js"),
	"@rttist/types/TypeParameterType": () => import("./types/TypeParameterType.js"),
	"@rttist/types/UnionOrIntersectionType": () => import("./types/UnionOrIntersectionType.js"),
	"@rttist/types/UnionType": () => import("./types/UnionType.js"),
	"@rttist/types/UniqueSymbolType": () => import("./types/UniqueSymbolType.js"),
	"@rttist/infos/DecoratorInfo": () => import("./infos/DecoratorInfo.js"),
	"@rttist/infos/index": () => import("./infos/index.js"),
	"@rttist/infos/IndexInfo": () => import("./infos/IndexInfo.js"),
	"@rttist/infos/MethodInfo": () => import("./infos/MethodInfo.js"),
	"@rttist/infos/ParameterInfo": () => import("./infos/ParameterInfo.js"),
	"@rttist/infos/PropertyInfo": () => import("./infos/PropertyInfo.js"),
	"@rttist/infos/SignatureInfo": () => import("./infos/SignatureInfo.js"),
});

export const getType: <T>(...args: any[]) => Type = createGetTypeFunction(InternalMetadataLibrary);
export const resolveType = InternalMetadataLibrary.resolveType.bind(InternalMetadataLibrary);
export const _ = {
	cs$: createCallsite,
	resFnCs$: resolveFromFunctionCallsite,
	resMCs$: resolveFromMethodCallsite,
	getTP$: getClassTypeParameter,
};
/** @internal */
export const Metadata: MetadataLibrary = InternalMetadataLibrary;