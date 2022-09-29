import {
	ModuleIdentifier,
	ModuleReference,
	TypeIdentifier
}                                   from "@rttist/abstract";
import { ModuleIds }                from "@rttist/core";
import * as ts                      from "typescript";
import { Context }                  from "../contexts/Context";
import { TransformerContext }       from "../contexts/TransformerContext";
import { TypeInfo }                 from "../declarations/general";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import {
	ModuleMetadataProperties,
	ModuleProperties,
	TypeProperties
}                                   from "../declarations/TypeProperties";
import { getTypeProperties }        from "../properties/getTypeProperties";
import { getSourceFile }            from "../utils/findSourceFile";
import { getSourceFileId }          from "../utils/getSourceFileId";
import { getNodeLocationText }      from "../utils/traceHelpers";

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
	 * Module for native types.
	 * @private
	 */
	public static Unknown = new ModuleMetadata({
		id: ModuleIds.Unknown,
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
	 * @param typeReference
	 * @param type
	 * @param symbol
	 * @param context
	 */
	addType(
		typeReference: TransformerTypeReference,
		type: ts.Type,
		symbol: ts.Symbol | undefined,
		context: Context
	): false | TypeProperties
	{
		let existingProperties = this.types.get(typeReference.id);

		if (existingProperties !== undefined)
		{
			return false;
		}

		context.log.trace("Adding type", typeReference.id);

		const typeInfo: TypeInfo = {
			typeReference,
			type
		};
		this.types.set(typeReference.id, typeInfo);

		typeInfo.properties = getTypeProperties(typeReference, type, symbol, context);

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