import type { AnyTypeMetadata, TypeReference } from "../declarations";
import { CALLSITE_ARGS_TYPE_PROPERTY, CALLSITE_TYPE_ARGS_PROPERTY, TypeIds } from "@rttist/core";
import { getTypeFactory } from "../factories/TypeFactoryProvider";
import type { MetadataLibrary } from "../MetadataLibrary";
import { invalidTypeGenerator } from "./invalidTypeGenerator";

/**
 * Resolves callsite of a function, or it returns generator of Invalid type references.
 * @param fn
 * @param argumentTypesMappers
 * @param metadataLibrary Required when `argumentTypesMappers` is provided and callsite contains metadata.
 */
export function resolveFromFunctionCallsite(
	fn: Function,
	argumentTypesMappers?: Array<(typeReference: TypeReference) => TypeReference>,
	metadataLibrary?: MetadataLibrary
): Array<TypeReference> | Generator<TypeReference, void, unknown> {
	const callsiteTypeArgs: TypeReference[] | undefined = (fn as any)[CALLSITE_TYPE_ARGS_PROPERTY];
	(fn as any)[CALLSITE_TYPE_ARGS_PROPERTY] = undefined;

	if (argumentTypesMappers !== undefined && argumentTypesMappers.length > 0) {
		const typeArgsCount = Math.max(argumentTypesMappers.length, callsiteTypeArgs?.length ?? 0);
		const callsiteArgsTypeOrMetadata: Array<TypeReference | AnyTypeMetadata> | undefined = (fn as any)[
			CALLSITE_ARGS_TYPE_PROPERTY
		];
		(fn as any)[CALLSITE_ARGS_TYPE_PROPERTY] = undefined;

		const callsiteArgsType: TypeReference[] =
			callsiteArgsTypeOrMetadata?.map((typeReferenceOrMetadata) => {
				if (typeReferenceOrMetadata?.constructor === Object) {
					const type = getTypeFactory().create(typeReferenceOrMetadata as AnyTypeMetadata);
					metadataLibrary?.asExpandable().addType(type);
					return type.id;
				}

				return typeReferenceOrMetadata as TypeReference;
			}) ?? [];

		return (function* () {
			for (let i = 0; i < typeArgsCount; i++) {
				const typeArg = callsiteTypeArgs?.[i];

				if (typeArg !== undefined) {
					yield typeArg;
				}

				const argType = callsiteArgsType[i];

				if (argType === undefined) {
					yield TypeIds.Invalid;
					continue;
				}

				const mapper = argumentTypesMappers[i];
				yield mapper?.(argType) ?? TypeIds.Invalid;
			}

			yield* invalidTypeGenerator();
		})();
	}
	return callsiteTypeArgs || invalidTypeGenerator();
}
