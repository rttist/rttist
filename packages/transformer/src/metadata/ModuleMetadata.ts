import {
	ModuleIdentifier,
	ModuleReference,
	TypeIdentifier
}                              from "@rttist/abstract";
import { ModuleIds }           from "@rttist/core";
import * as ts                 from "typescript";
import { Context }             from "../contexts/Context";
import { TransformerContext }  from "../contexts/TransformerContext";
import { TypeInfo }            from "../declarations/general";
import {
	ModuleMetadataProperties,
	ModuleProperties,
	TypePropertiesWithId
}                              from "../declarations/TypeProperties";
import { getTypeProperties }   from "../properties/getTypeProperties";
import { getSourceFile }       from "../utils/findSourceFile";
import { getSourceFileId }     from "../utils/getSourceFileId";
import { getNodeLocationText } from "../utils/traceHelpers";

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

	/**
	 * Module for invalid types.
	 * @private
	 */
	public static Invalid = new ModuleMetadata({
		id: ModuleIds.Invalid,
		name: "",
		path: "",
	});

	private readonly moduleProperties: ModuleMetadataProperties;
	private readonly types = new Map<TypeIdentifier, TypeInfo>();

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
	 * @param typeInfo
	 * @param symbol
	 * @param context
	 */
	addType(
		typeInfo: TypeInfo,
		symbol: ts.Symbol | undefined,
		context: Context
	): void
	{
		// TODO: Remove this check. It is checked in MetadataLibrary.
		if (this.types.has(typeInfo.typeReference.id))
		{
			context.log.warn(`ModuleMetadata.addType(): The type '${typeInfo.typeReference.id}' is already in the module.`);
			return;
		}

		context.log.trace("Adding type", typeInfo.typeReference.id, "to", this.moduleProperties.id);

		this.types.set(typeInfo.typeReference.id, typeInfo);

		typeInfo.properties = getTypeProperties(typeInfo.type, symbol, context) as TypePropertiesWithId;
		typeInfo.properties!.id = typeInfo.typeReference.id;
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
				sourceFileContext.log.warn(`SourceFile of child module '${importDeclaration.moduleSpecifier.getText()}' `
					+ `not found.\n\tAt ${getNodeLocationText(importDeclaration)}`);
			}
		}

		return references;
	}
}