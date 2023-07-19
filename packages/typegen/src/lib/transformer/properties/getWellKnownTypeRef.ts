// import * as ts from "typescript";
// import { TypeKind, NativeTypeKind } from "rttist";
// import { TransformerTypeReference } from "../../metadata/transformer-type-reference";
//
// /**
//  * @param sourceFileId
//  * @param type
//  * @param symbol
//  */
// export function getWellKnownTypeRef(
// 	sourceFileId: string,
// 	type: ts.Type,
// 	symbol: ts.Symbol
// ): TransformerTypeReference | undefined {
// 	return NameMap[sourceFileId + ":" + symbol.escapedName];
// }
//
// function ct(module: string, name: string, kind: NativeTypeKind) {
// 	return new TransformerTypeReference(module, name, kind);
// }
//
// const NameMap: { [name: string]: TransformerTypeReference } = {
// 	"@rttist/dist/Type:Type": ct("@rttist/dist/Type", "Type", TypeKind.RttistType),
// 	"@rttist/dist/Module:Module": ct("@rttist/dist/Module", "Module", TypeKind.RttistModule),
// };
