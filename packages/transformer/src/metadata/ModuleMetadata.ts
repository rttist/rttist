import { ModuleReference }     from "@rttist/abstract";
import * as ts                 from "typescript";
import { Context }             from "../contexts/Context";
import { TransformerContext }  from "../contexts/TransformerContext";
import { TypeInfo }            from "../declarations/general";
import {
	ModuleMetadataProperties,
	ModuleProperties,
	TypeProperties
}                              from "../declarations/TypeProperties";
import { getTypeProperties }   from "../properties/getTypeProperties";
import { getSourceFile }       from "../utils/findSourceFile";
import { getNodeLocationText } from "../utils/traceHelpers";
import { getSourceFileId }     from "../utils/typeHelpers";

/**
 * Class containing metadata of one Module/SourceFile.
 */
export class ModuleMetadata
{
	/**
	 * Module for unknown types.
	 * @private
	 */
	private static unknownModule?: ModuleMetadata;

	/**
	 * Module for native types.
	 * @private
	 */
	private static nativeModule?: ModuleMetadata;

	private readonly moduleProperties: ModuleMetadataProperties;
	private readonly types = new Map<ts.Type, TypeInfo>();

	/**
	 * @param properties
	 * @param context
	 */
	private constructor(properties: ModuleMetadataProperties, private context: Context)
	{
		this.moduleProperties = properties;
	}

	/**
	 * Create ModuleMetadata object from SourceFile.
	 * @param sourceFile
	 * @param context
	 */
	public static createFromSourceFile(sourceFile: ts.SourceFile, context: Context): ModuleMetadata
	{
		const name = sourceFile.moduleName === undefined ? "" : sourceFile.moduleName;

		return new ModuleMetadata(
			{
				name,
				id: getSourceFileId(sourceFile),
				path: sourceFile.fileName,
				children: this.getChildrenReferences(sourceFile)
			},
			context
		);
	}

	// /**
	//  * Returns module for unknown types.
	//  * @param context
	//  */
	// public static getUnknownModule(context: TransformerContext): ModuleMetadata
	// {
	// 	if (!ModuleMetadata.unknownModule)
	// 	{
	// 		ModuleMetadata.unknownModule = new ModuleMetadata(
	// 			{
	// 				name: "native",
	// 				path: "",
	// 				id: ModuleIds.Unknown
	// 			},
	// 			undefined
	// 		);
	// 	}
	//
	// 	return ModuleMetadata.unknownModule;
	// }
	//
	// /**
	//  * Returns module for unknown types.
	//  * @param context
	//  */
	// public static getNativeModule(context: TransformerContext): ModuleMetadata
	// {
	// 	if (!ModuleMetadata.nativeModule)
	// 	{
	// 		ModuleMetadata.nativeModule = new ModuleMetadata(
	// 			{
	// 				name: "native",
	// 				path: "",
	// 				id: ModuleIds.Native
	// 			},
	// 			undefined
	// 		);
	// 	}
	//
	// 	return ModuleMetadata.nativeModule;
	// }

	/**
	 * Returns properties of this module.
	 */
	getModuleProperties({ withoutTypes = false }: { withoutTypes?: boolean } = { withoutTypes: false }): ModuleProperties
	{
		return {
			...this.moduleProperties,
			types: withoutTypes ? undefined : Array.from(this.types.values()).map(typeInfo => typeInfo.properties!)
		};
	}

	/**
	 * Try to add type to the module metadata. Returns true if type was added, false if type was included already.
	 * @param type
	 */
	addType(type: ts.Type): false | TypeProperties
	{
		let existingProperties = this.types.get(type);

		if (existingProperties !== undefined)
		{
			return false;
		}

		const typeInfo: TypeInfo = {};
		this.types.set(type, typeInfo);

		typeInfo.properties = getTypeProperties(type, this.context);

		return typeInfo.properties;
	}

	private static getChildrenReferences(sourceFile: ts.SourceFile)
	{
		const index = sourceFile.statements.findIndex(s => !ts.isImportDeclaration(s));
		const references: Array<ModuleReference> = [];

		let importDeclaration: ts.ImportDeclaration;
		for (let i = 0; i < index; i++)
		{
			importDeclaration = sourceFile.statements[i] as ts.ImportDeclaration;

			if (importDeclaration.importClause?.isTypeOnly)
			{
				continue;
			}

			const childSourceFile = getSourceFile(importDeclaration);

			if (childSourceFile)
			{
				references.push(getSourceFileId(childSourceFile));
			}
			else
			{
				const sourceFileContext = TransformerContext.instance.currentSourceFileContext!;
				sourceFileContext.log.error(`SourceFile of module '${importDeclaration.moduleSpecifier.getText()}' `
					+ `not found.\n\tAt ${getNodeLocationText(importDeclaration)}`);
			}
		}

		return references;
	}
}