import {
	ModuleIdentifier,
	ModuleReference
}                              from "@rttist/abstract";
import { ModuleIds }           from "@rttist/core";
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
import {
	getSourceFileId,
	getTypeId
}                              from "../utils/typeHelpers";

/**
 * Class containing metadata of one Module/SourceFile.
 */
export class ModuleMetadata
{
	/**
	 * Module for native types.
	 * @private
	 */
	public static Native = new ModuleMetadata({
		id: ModuleIds.Native,
		name: "",
		path: "typescript",
	});

	private readonly moduleProperties: ModuleMetadataProperties;
	private readonly types = new Map<ts.Type, TypeInfo>();

	get id(): ModuleIdentifier
	{
		return this.moduleProperties.id;
	}

	/**
	 * @param properties
	 */
	constructor(properties: ModuleMetadataProperties)
	{
		this.moduleProperties = properties;
	}

	/**
	 * Create ModuleMetadata object from SourceFile.
	 * @param sourceFile
	 */
	public static createFromSourceFile(sourceFile: ts.SourceFile): ModuleMetadata
	{
		const name = sourceFile.moduleName === undefined ? "" : sourceFile.moduleName;

		return new ModuleMetadata(
			{
				name,
				id: getSourceFileId(sourceFile),
				path: sourceFile.fileName,
				children: this.getChildrenReferences(sourceFile)
			}
		);
	}

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
	 * @param context
	 */
	addType(type: ts.Type, context: Context): false | TypeProperties
	{
		let existingProperties = this.types.get(type);

		if (existingProperties !== undefined)
		{
			return false;
		}

		context.log.trace("Adding type", getTypeId(type, context.typeChecker));

		const typeInfo: TypeInfo = {};
		this.types.set(type, typeInfo);

		typeInfo.properties = getTypeProperties(type, context);

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