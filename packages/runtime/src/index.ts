import {
	Module,
	ModuleIdentifier,
	ModuleReference,
	TypeMetadata,
	createType,
	AnyTypeMetadata,
	Metadata
} from "@rttist/abstract";

//
// const resolver = {
// 	resolveType(typeRef: TypeReference): Type
// 	{
// 		return Metadata.resolveType(typeRef);
// 	},
// 	resolveModule(moduleRef: ModuleReference): Module
// 	{
// 		return Metadata.resolveModule(moduleRef);
// 	}
// };
//
// const globalObject: any = typeof globalThis === "object"
// 	? globalThis
// 	: typeof window === "object"
// 		? window
// 		: global;
//
// globalObject["__τ"] = resolver;
//
// declare global
// {
// 	const __τ: typeof resolver;
// }


export type ModuleMetadata = {
	id: ModuleIdentifier;
	name: string;
	path: string;
	children?: ModuleReference[];
	types?: TypeMetadata[];
};

export function loadModule(metadata: ModuleMetadata)
{
	const types = metadata.types?.map(typeMetadata => createType(typeMetadata as AnyTypeMetadata));

	const module = new Module({
		types,
		id: metadata.id,
		name: metadata.name,
		path: metadata.path,
		children: metadata.children,
	});

	Metadata.addModule(module);
}

export function loadEncodedModule(metadata: string)
{

}