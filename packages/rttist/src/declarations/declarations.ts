export type AsyncCtorReference = () => Promise<{ new (...args: any[]): any } | undefined>;
export type ModuleIdentifier = string;
export type ModuleReference = ModuleIdentifier;
export type TypeIdentifier = string;
export type TypeReference = TypeIdentifier;
export type TypesConfiguration = { nullability?: boolean };
