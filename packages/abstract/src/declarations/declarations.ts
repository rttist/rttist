import type { NativeTypeKind } from "../enums";

export type AsyncCtorReference = () => Promise<{ new(...args: any[]): any } | undefined>;
export type SyncCtorReference = () => { new(...args: any[]): any };
export type ModuleIdentifier = string;
export type ModuleReference = ModuleIdentifier;
export type NativeTypeReference = [NativeTypeKind];
export type TypeIdentifier = string;
export type TypeReference = TypeIdentifier | NativeTypeReference;
export type TypesConfiguration = { nullability?: boolean };