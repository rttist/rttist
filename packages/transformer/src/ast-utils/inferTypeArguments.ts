import * as ts                 from "typescript";
import { Context }             from "../contexts/Context";
import { TypeArgumentsInfo }   from "../declarations/callsites";
import { getNodeLocationText } from "../tracers/getNodeLocationText";
import { getDeclaration }      from "../utils/symbolHelpers";

export function inferTypeArguments(
	node: ts.CallExpression | ts.NewExpression,
	context: Context
): undefined | TypeArgumentsInfo
{
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
		context.log.ifInfo(() => [
			`There is an callExpression but no declaration of function/method has been found.\n\t`,
			getNodeLocationText(node)
		]);
		return undefined;
	}

	// Return node. There is no type parameter, so there is nothing to do (no type info to pass).
	if (declaration.typeParameters === undefined || declaration.typeParameters.length === 0)
	{
		return undefined;
	}

	const typeParametersTypes = declaration.typeParameters.map(tp => context.typeChecker.getTypeAtLocation(tp));
	const parametersTypes = declaration.parameters.map(tp => context.typeChecker.getTypeAtLocation(tp));
	const typeArgTypes: TypeArgumentsInfo = [];
	let anyMatch = false;

	for (const typeParameterType of typeParametersTypes)
	{
		const parameterIndex = parametersTypes.indexOf(typeParameterType);

		if (parameterIndex !== -1)
		{
			const args = node.arguments || [];
			anyMatch = true;

			typeArgTypes.push([
				context.typeChecker.getTypeAtLocation(args[parameterIndex]),
				context.typeChecker.getSymbolAtLocation(args[parameterIndex])
			]);
		}
		else
		{
			typeArgTypes.push(undefined);
		}
	}

	if (!anyMatch)
	{
		// In this case, we can enhance infer logic,.. but it would be complex...
		context.log.ifInfo(() => [
			"Failed to infer type parameters from call-expression's argument.\n\t",
			getNodeLocationText(node)
		]);

		return undefined;
	}

	return typeArgTypes;
}