import {
	TypeIdentifier,
	TypeKind
}                    from "@rttist/abstract";
import {
	ModuleIds,
	TypeIds
} from "@rttist/core";

/**
 * Return TypeIdentifier whether the type is a primitive native type.
 * @param typeKind
 */
export function getIdOfPrimitiveTypeKind(typeKind: TypeKind): TypeIdentifier | undefined
{
	return PrimitiveTypesIdMap[typeKind];
}

const PrimitiveTypesIdMap: { [typeKind: number]: TypeIdentifier } = {
	[TypeKind.String]: ModuleIds.Native + "::String",
	[TypeKind.Number]: ModuleIds.Native + "::Number",
	[TypeKind.Boolean]: ModuleIds.Native + "::Boolean",
	[TypeKind.BigInt]: ModuleIds.Native + "::BigInt",
	[TypeKind.Symbol]: ModuleIds.Native + "::Symbol",
	[TypeKind.Any]: TypeIds.Any,
	[TypeKind.Unknown]: TypeIds.Unknown,
	[TypeKind.Never]: TypeIds.Never,
	[TypeKind.Undefined]: TypeIds.Undefined,
	[TypeKind.Null]: TypeIds.Null,
	[TypeKind.Void]: TypeIds.Void,
};