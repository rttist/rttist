import * as ts                 from "typescript";
import { Context }             from "../contexts/Context";
import { TypeArgumentsInfo }   from "../declarations/callsites";
import { getNodeLocationText } from "../tracers/getNodeLocationText";
import { getDeclaration }      from "../utils/symbolHelpers";

export function inferTypeArguments(
	node: ts.CallExpression | ts.NewExpression,
	context: Context
): TypeArgumentsInfo
{
	const typeArgTypes: TypeArgumentsInfo = [];
	const symbol = context.typeChecker.getSymbolAtLocation(node.expression);
	const symbolDeclaration: ts.Declaration | undefined = symbol && getDeclaration(symbol);
	let declaration: ts.SignatureDeclarationBase | undefined = symbolDeclaration as ts.SignatureDeclarationBase | undefined;

	if (symbolDeclaration && (
		ts.isVariableDeclaration(symbolDeclaration)
		|| ts.isPropertyAssignment(symbolDeclaration)
		|| ts.isPropertyDeclaration(symbolDeclaration)
	))
	{
		declaration = symbolDeclaration.initializer as ts.SignatureDeclarationBase | undefined;
	}

	if (!declaration)
	{
		context.log.info(
			`There is an callExpression but no declaration of function/method has been found.\n\t`,
			getNodeLocationText(node)
		);
		return typeArgTypes;
	}

	// Return node. There is no type parameter, so there is nothing to do (no type info to pass).
	if (declaration.typeParameters === undefined || declaration.typeParameters.length === 0)
	{
		return typeArgTypes;
	}

	const typeParametersTypes = declaration.typeParameters.map(tp => context.typeChecker.getTypeAtLocation(tp));
	const parametersTypes = declaration.parameters.map(tp => context.typeChecker.getTypeAtLocation(tp));

	for (const typeParameterType of typeParametersTypes)
	{
		const parameterIndex = parametersTypes.indexOf(typeParameterType);

		if (parameterIndex !== -1)
		{
			const args = node.arguments || [];

			typeArgTypes.push([
				context.typeChecker.getTypeAtLocation(args[parameterIndex]),
				context.typeChecker.getSymbolAtLocation(args[parameterIndex])
			]);
		}
		else
		{
			// In this case, we can enhance infer logic,.. but it would be complex...
			context.log.warn(
				"Failed to infer type parameter from call-expression's argument.\n\t",
				getNodeLocationText(node)
			);
			typeArgTypes.push(undefined);
		}
	}
	
	return typeArgTypes;
}