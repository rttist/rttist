import * as ts              from "typescript";
import { Context }          from "../contexts/Context";
import { MethodProperties } from "../declarations/TypeProperties";

// export function getMethodGenerics(symbol: ts.Symbol, context: Context): Array<MethodProperties>
// {
// 	const value = symbol?.valueDeclaration as ts.MethodDeclaration;
//
// 	return (value?.typeParameters ?? []).map(generic => {
// 		const type = context.typeChecker.getTypeAtLocation(generic);
// 		return getTypeCall(type, symbol, context);
// 	});
// }
//
// /**
//  * Extracted to its own method, hopefully we should be able to use
//  * this for other method descriptions, than just a class method
//  *
//  * @param {ts.Symbol} symbol
//  * @param {Context} context
//  * @returns {MethodProperties}
//  */
// export function getMethodProperties(symbol: ts.Symbol, context: Context): MethodProperties
// {
// 	const methodSignature = getFunctionLikeSignature(symbol, context);
// 	const returnType = methodSignature?.getReturnType();
//
// 	// TODO: Finish this implementation of methods
// 	return {
// 		n: symbol.escapedName.toString(),
// 		params: methodSignature && getSignatureParameters(methodSignature, context),
// 		rt: returnType && getTypeCall(returnType, returnType.symbol, context) || UnknownTypeReference,
// 		d: getDecorators(symbol, context),
// 		tp: getMethodGenerics(symbol, context),
// 		o: (symbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional,
// 		am: getAccessModifier(symbol.valueDeclaration?.modifiers)
// 	};
// }


// export function getMethodGenerics(symbol: ts.Symbol, context: Context): Array<GetTypeCall>
// {
// 	const value = symbol?.valueDeclaration as ts.MethodDeclaration;
//
// 	return (value?.typeParameters ?? []).map(generic => {
// 		const type = context.typeChecker.getTypeAtLocation(generic);
// 		return getTypeCall(type, symbol, context);
// 	});
// }
//
// /**
//  * Extracted to its own method, hopefully we should be able to use
//  * this for other method descriptions, than just a class method
//  *
//  * @param {ts.Symbol} symbol
//  * @param {ts.Declaration} declaration
//  * @param {Context} context
//  * @returns {MethodDescriptionSource}
//  */
// export function getMethodDescription(symbol: ts.Symbol, declaration: ts.Declaration, context: Context): MethodDescriptionSource
// {
// 	const methodSignature = getFunctionLikeSignature(symbol, declaration, context.typeChecker);
// 	const returnType = methodSignature?.getReturnType();
//
// 	return {
// 		n: symbol.escapedName.toString(),
// 		params: methodSignature && getSignatureParameters(methodSignature, context),
// 		rt: returnType && getTypeCall(returnType, returnType.symbol, context) || getUnknownTypeCall(context),
// 		d: getDecorators(symbol, context),
// 		tp: getMethodGenerics(symbol, context),
// 		o: (symbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional,
// 		am: getAccessModifier(symbol.valueDeclaration?.modifiers)
// 	};
// }

/**
 * Return methods of Type
 * @param context
 * @param type
 */
export function getMethods(type: ts.Type, context: Context): Array<MethodProperties> | undefined
{
	// if (!symbol?.members)
	// {
	// 	return undefined;
	// }

	const signature = type.getCallSignatures();

	// TODO: Methods
	// const members = type.getProperties();
	//
	// const methods = members
	// 	.filter(m => (m.flags & ts.SymbolFlags.Method) === ts.SymbolFlags.Method || (m.flags & ts.SymbolFlags.Function) === ts.SymbolFlags.Function)
	// 	.flatMap(
	// 		(memberSymbol: ts.Symbol) => memberSymbol.getDeclarations()?.map(
	// 			declaration => getMethodDescription(memberSymbol, declaration, context)
	// 		) ?? []
	// 	);
	//
	// return methods.length ? methods : undefined;

	return undefined;
}
