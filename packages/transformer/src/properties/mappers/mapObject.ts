import { TypeKind }                from "@rttist/abstract";
import * as ts                     from "typescript";
import { Context }                 from "../../contexts/Context";
import { printTypeDebugInfo }      from "../../debugs/printTypeDebugInfo";
import {
	TypeMapper,
	TypeMapperResult
}                                  from "../../declarations/mappers";
import {
	ClassProperties,
	TypeProperties
}                                  from "../../declarations/TypeProperties";
import { getDecorators }           from "../../utils/getDecorators";
import { isExported }              from "../../utils/isExported";
import { getDeclaration }          from "../../utils/symbolHelpers";
import {
	getSymbol,
	getTypeId
}                                  from "../../utils/typeHelpers";
import { getConstructors }         from "../getConstructors";
import { getDecoratorsProperties } from "../getDecoratorsProperties";
import { getMethods }              from "../getMethods";
import { getProperties }           from "../getProperties";
import { mapObjectLiteral }        from "./mapObjectLiteral";
import { mapTuple }                from "./mapTuple";

const ObjectFlagsMappers: { [typeFlag: number]: TypeMapper } = {
	[ts.ObjectFlags.Tuple]: mapTuple as TypeMapper,
	[ts.ObjectFlags.ObjectLiteral]: mapObjectLiteral as TypeMapper,
	[ts.ObjectFlags.Anonymous]: mapObjectLiteral as TypeMapper,
};

export function mapObject(type: ts.ObjectType/*, typeNode: ts.TypeNode| undefined*/, context: Context): TypeMapperResult
{
	const mapper = ObjectFlagsMappers[type.objectFlags];

	if (mapper)
	{
		const mapperResult = mapper(type, context);

		if (mapperResult)
		{
			return mapperResult;
		}

		// context.log.warn("Unhandled type. " + printTypeDebugInfo(type, context.typeChecker));
	}

	const symbol = getSymbol(type, context.typeChecker);

	if ((type.objectFlags & ts.ObjectFlags.Class) !== 0 || (type.objectFlags & ts.ObjectFlags.Interface) !== 0)
	{
		// const decorators = getDecorators(symbol, context);
		// let localType = false;
		// let props = type.getProperties();

		const declaration = getDeclaration(symbol);

		const properties: TypeProperties = {
			id: getTypeId(type, context.typeChecker),
			kind: type.objectFlags === ts.ObjectFlags.Class ? TypeKind.Class : TypeKind.Interface,
			name: symbol?.getEscapedName().toString() ?? "",
			// fullName: getTypeFullName(type, context),
			properties: getProperties(type, context),
			methods: getMethods(type, context),
			// decorators: decorators,
			exported: declaration && isExported(declaration) ? true : undefined
		};

		if ((type.objectFlags & ts.ObjectFlags.Class) !== 0)
		{
			if (declaration !== undefined && ts.isClassDeclaration(declaration))
			{
				(properties as ClassProperties).decorators = getDecoratorsProperties(declaration, context);

				if (declaration.heritageClauses)
				{
					const ext = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ExtendsKeyword)[0];

					if (ext)
					{
						(properties as ClassProperties).baseType = context.metadata.referenceType(
							context.typeChecker.getTypeFromTypeNode(ext.types[0]),
							undefined,
							context
						);
					}

					const impl = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ImplementsKeyword)[0];

					if (impl)
					{
						(properties as ClassProperties).interface = context.metadata.referenceType(
							context.typeChecker.getTypeFromTypeNode(impl.types[0]),
							undefined,
							context
						);
					}
				}
			}

			return {
				...properties,
				constructors: getConstructors(type, context),
				ctor: undefined, // TODO: Create ImportDetails and let middlewares to generate imports or generate import right here??
				ctorSync: undefined,
			};

			const constructorExport = undefined;//getExportOfConstructor(symbol, context); // TODO: Implement

			if (constructorExport)
			{
				// // if (context.config.isServerMode())
				// // {
				// // 	properties.ctorDesc = createValueExpression(constructorExport);
				// // }
				//
				// const [ctorGetter, ctorRequireCall] = createCtorPromise(constructorExport, context);
				//
				// if (ctorGetter)
				// {
				// 	properties.ctor = ctorGetter;
				//
				// 	// // TODO: Review. TypeCtors seems unused.
				// 	// if (ctorRequireCall)
				// 	// {
				// 	// 	context.addTypeCtor(ctorRequireCall);
				// 	// }
				// }
			}
			// If it is not exported, it must be getType<> of local class; in that case, we have direct access to class. But this type info must be generated in file.
			else
			{
				properties.exported = undefined;

				// if (ts.isTypeReferenceNode(typeNode))
				// {
				// 	let expression: ts.Expression = getTypeNodeIdentifier(typeNode) as ts.Expression;
				//
				// 	if (expression)
				// 	{
				// 		// In "typelib" mode we have to use typeof() to ensure there will be no error after getting ctor, 
				// 		// because Identifier will be undefined in typelib file
				// 		if (context.config.metadataType == MetadataTypeValues.typeLib)
				// 		{
				// 			expression = ts.factory.createConditionalExpression(
				// 				ts.factory.createBinaryExpression(
				// 					ts.factory.createTypeOfExpression(expression),
				// 					ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
				// 					ts.factory.createStringLiteral("function")
				// 				),
				// 				ts.factory.createToken(ts.SyntaxKind.QuestionToken),
				// 				expression,
				// 				ts.factory.createToken(ts.SyntaxKind.ColonToken),
				// 				ts.factory.createIdentifier("undefined")
				// 			);
				// 		}
				//
				// 		// function() { return Promise.resolve(TypeCtor) }
				// 		properties.ctor = ts.factory.createFunctionExpression(
				// 			undefined,
				// 			undefined,
				// 			undefined,
				// 			undefined,
				// 			[],
				// 			undefined,
				// 			ts.factory.createBlock([
				// 				ts.factory.createReturnStatement(
				// 					ts.factory.createCallExpression(
				// 						ts.factory.createPropertyAccessExpression(
				// 							ts.factory.createIdentifier("Promise"),
				// 							ts.factory.createIdentifier("resolve")
				// 						),
				// 						undefined,
				// 						[
				// 							expression
				// 						]
				// 					)
				// 				)
				// 			], true)
				// 		);
				// 	}
				// }
			}
		}

		// if (declaration && (ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)))
		// {
		// 	// extends & implements
		// 	if (declaration.heritageClauses)
		// 	{
		// 		const ext = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ExtendsKeyword)[0];
		//
		// 		if (ext)
		// 		{
		// 			properties.baseType = context.metadata.addType(undefined, ext.types[0]);
		// 			// getTypeCall(
		// 			// 	context.typeChecker.getTypeAtLocation(ext.types[0]),
		// 			// 	context.typeChecker.getSymbolAtLocation(ext.types[0]),
		// 			// 	context
		// 			// );
		// 		}
		//
		// 		const impl = declaration.heritageClauses.filter(h => h.token == ts.SyntaxKind.ImplementsKeyword)[0];
		//
		// 		if (impl)
		// 		{
		// 			properties.interface = context.metadata.addType(undefined, impl.types[0]);
		// 			// getTypeCall(
		// 			// 	context.typeChecker.getTypeAtLocation(impl.types[0]),
		// 			// 	context.typeChecker.getSymbolAtLocation(impl.types[0]),
		// 			// 	context
		// 			// );
		// 		}
		// 	}
		//
		// 	// Type parameters
		// 	if (declaration.typeParameters)
		// 	{
		// 		properties.typeParameters = declaration.typeParameters.map(typeParameterDeclaration => {
		// 				// typeParameterDeclaration.
		// 				const type = context.typeChecker.getTypeAtLocation(typeParameterDeclaration);
		// 				const typeNode = context.typeChecker.typeToTypeNode(type, declaration, undefined); // TODO: Review this!!!!!!!!!
		//
		// 				if (typeNode)
		// 				{
		// 					return context.metadata.addType(undefined, typeNode);
		// 				}
		// 				// 	context.typeChecker.getTypeAtLocation(typeParameterDeclaration),
		// 				// 	context.typeChecker.getSymbolAtLocation(typeParameterDeclaration),
		// 				// 	context
		// 				// )
		//
		// 				return UnknownTypeReference;
		// 			}
		// 		);
		// 	}
		// }

		return properties;
	}

	if (type.aliasSymbol && type.aliasTypeArguments)
	{
		// type.mapper
	}

	switch (type.objectFlags)
	{
		case ts.ObjectFlags.Reference:
			break;

		case ts.ObjectFlags.JsxAttributes:
			break;

		case ts.ObjectFlags.ArrayLiteral:
			break;
	}

	context.log.warn("Unhandled type. " + printTypeDebugInfo(type, context.typeChecker));

	return undefined;

	// return {
	// 	properties: {
	// 		k: TypeKind.UniqueSymbol,
	// 		n: type.escapedName?.toString()
	// 	},
	// 	localType: false
	// };
}