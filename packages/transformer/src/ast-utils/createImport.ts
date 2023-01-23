import * as ts                from "typescript";
import { TransformerContext } from "../contexts/TransformerContext";

export function createImport(
	identifier: ts.Identifier,
	moduleSpecifier: string
): ts.ImportDeclaration | ts.Statement
{
	if (TransformerContext.instance.config.moduleResolution === ts.ModuleResolutionKind.Node16
		|| TransformerContext.instance.config.moduleResolution === ts.ModuleResolutionKind.NodeNext)
	{
		return ts.factory.createImportDeclaration(
			undefined,
			ts.factory.createImportClause(
				false,
				identifier,
				undefined
			),
			ts.factory.createStringLiteral(moduleSpecifier)
		);
	}

	const callExpression = ts.factory.createCallExpression(
		ts.factory.createIdentifier("require"),
		undefined,
		[ts.factory.createStringLiteral(moduleSpecifier)]
	);

	return ts.factory.createVariableStatement(
		undefined,
		ts.factory.createVariableDeclarationList(
			[
				ts.factory.createVariableDeclaration(
					identifier,
					undefined,
					undefined,
					callExpression
				)
			],
			ts.NodeFlags.Const
		)
	);
}