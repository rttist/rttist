import type { NativeTypeKind } from "../enums/TypeKind";

export type AsyncCtorReference = () => Promise<{ new(...args: any[]): any } | undefined>;
export type SyncCtorReference = () => { new(...args: any[]): any };
export type ModuleIdentifier = string; //number | symbol;
export type ModuleReference = ModuleIdentifier;
export type NativeTypeReference = [NativeTypeKind];
export type TypeIdentifier = string;
export type TypeReference = TypeIdentifier | NativeTypeReference;
export type TypesConfiguration = { nullability?: boolean };
// export type FlattenedObject = {
// 	properties: { [propertyName: string]: PropertyInfo },
// 	methods: { [methodName: string]: MethodInfo }
// };