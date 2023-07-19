import * as ts from "typescript";
import { TransformerTypeReference } from "../../metadata/transformer-type-reference";
import { Context } from "../contexts/context";

export type ClassFlags = {
	abstract?: true;
	exported?: true;
};

export function getClassModifiers(declaration: ts.ClassLikeDeclaration): ClassFlags {
	const result: ClassFlags = {};

	ts.getModifiers(declaration)?.reduce((result, modifier) => {
		if (modifier.kind === ts.SyntaxKind.AbstractKeyword) {
			result.abstract = true;
		} else if (modifier.kind === ts.SyntaxKind.ExportKeyword) {
			result.exported = true;
		}

		return result;
	}, result);

	return result;
}

export type DeclarationHeritageClauses = {
	extends?: TransformerTypeReference[];
	implements?: TransformerTypeReference[];
};

export function getHeritageClauses(
	declaration: ts.ClassLikeDeclarationBase | ts.InterfaceDeclaration,
	context: Context
): DeclarationHeritageClauses {
	const result: DeclarationHeritageClauses = {};

	// if (declaration.heritageClauses) {
	// 	const ext = declaration.heritageClauses.filter((h) => h.token === ts.SyntaxKind.ExtendsKeyword)[0];
	//
	// 	if (ext) {
	// 		result.extends = ext.types.map((t) =>
	// 			context.metadata.addType(
	// 				context.typeChecker.getTypeFromTypeNode(t),
	// 				false,
	// 				context.typeChecker.getSymbolAtLocation(ext),
	// 				undefined,
	// 				context
	// 			)
	// 		);
	// 	}
	//
	// 	const impl = declaration.heritageClauses.filter((h) => h.token === ts.SyntaxKind.ImplementsKeyword)[0];
	//
	// 	if (impl) {
	// 		result.implements = impl.types.map((t) =>
	// 			context.metadata.addType(
	// 				context.typeChecker.getTypeFromTypeNode(t),
	// 				false,
	// 				context.typeChecker.getSymbolAtLocation(impl),
	// 				undefined,
	// 				context
	// 			)
	// 		);
	// 	}
	// }

	return result;
}
