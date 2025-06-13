// import { getCallsiteTypeArguments } from "@rttist/core";
// import { GenericTypeRegister } from "../GenericTypeRegister";
// import type { GetGenericClassFunction } from "../metadata-context-helpers";
// import type { MetadataLibrary } from "../MetadataLibrary";
// import type { Type } from "../Type";
// import { GlobalMetadata } from "../global-library";
//
// export function createGetGenericClass(metadataLibrary: MetadataLibrary): GetGenericClassFunction {
// 	function getGenericClass<T>(classCtor: { new (...args: any[]): T }, ...typeParameters: Type[]): Function {
// 		if (typeParameters.length === 0) {
// 			const callsiteArgs = getCallsiteTypeArguments(getGenericClass);
//
// 			if (callsiteArgs !== undefined && (callsiteArgs.length !== 0 || !!callsiteArgs[0])) {
// 				const type = metadataLibrary.resolveType(callsiteArgs[0]);
// 				return GenericTypeRegister.getGenericClass(
// 					classCtor,
// 					type.isGenericType() ? type.getTypeArguments() : [],
// 					metadataLibrary
// 				);
// 			}
// 		}
//
// 		return GenericTypeRegister.getGenericClass(classCtor, typeParameters, metadataLibrary);
// 	}
//
// 	return getGenericClass;
// }
//
// export const getGenericClass = createGetGenericClass(GlobalMetadata);
