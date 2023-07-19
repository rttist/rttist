// import { ModuleIds } from "@rttist/core";
// import * as ts from "typescript";
// import { TransformerTypeReference } from "../../metadata/transformer-type-reference";
// import { isLiteral } from "../utils/typeHelpers";
//
// export function getLiteralTypeReference(type: ts.Type) {
// 	if (isLiteral(type)) {
// 		const val =
// 			typeof type.value === "object"
// 				? toBigIntLiteral(type.value as ts.PseudoBigInt)
// 				: typeof type.value === "string"
// 				? "'" + type.value + "'"
// 				: type.value;
//
// 		return new TransformerTypeReference(ModuleIds.Native, "Literal(" + val + ")");
// 	}
// }
//
// function toBigIntLiteral(value: ts.PseudoBigInt) {
// 	return (value.negative ? "-" : "") + value.base10Value + "n";
// }
