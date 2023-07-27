import type { Config }              from "../config/Config";
import * as ts                      from "typescript";
import { changeExtensionForOutput } from "../utils/changeExtensionForOutput";

export function createImport(
	identifier: ts.Identifier,
	moduleSpecifier: string,
	config: Config
): ts.ImportDeclaration | ts.Statement
{
	moduleSpecifier = changeExtensionForOutput(moduleSpecifier, config);

	if (config.moduleResolution === ts.ModuleResolutionKind.Node16
		|| config.moduleResolution === ts.ModuleResolutionKind.NodeNext)
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