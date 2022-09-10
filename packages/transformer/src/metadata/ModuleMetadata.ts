import * as ts                      from "typescript";
import { ModuleReference }          from "@rtti/abstract";
import { TransformerContext }       from "../contexts/TransformerContext";
import { TransformerTypeReference } from "../declarations/general";
import {
	ModuleMetadataProperties,
	ModuleProperties,
	TypeProperties
}                                   from "../declarations/TypeProperties";
import { getTypeProperties }        from "../properties/getTypeProperties";
import { getSourceFile }            from "../utils/findSourceFile";
import { getNodeLocationText }      from "../utils/traceHelpers";
import { getSourceFileId }          from "../utils/typeHelpers";

type TypeInfo = { properties: TypeProperties | undefined };

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
	 * @param context
	 * @param sourceFile
	 */
	constructor(private readonly context: TransformerContext, private readonly sourceFile: ts.SourceFile)
	{
		this.moduleProperties = this.gatherModuleProperties();
	}

	/**
	 * Returns module for unknown types.
	 * @param context
	 */
	public static getUnknownModule(context: TransformerContext): ModuleMetadata
	{
		if (!ModuleMetadata.unknownModule)
		{
			ModuleMetadata.unknownModule = new ModuleMetadata(
				context,
				ts.factory.createSourceFile(
					[],
					ts.factory.createToken(ts.SyntaxKind.EndOfFileToken
					),
					ts.NodeFlags.None
				)
			);
		}

		return ModuleMetadata.unknownModule;
	}

	/**
	 * Returns module for unknown types.
	 * @param context
	 */
	public static getNativeModule(context: TransformerContext): ModuleMetadata
	{
		if (!ModuleMetadata.nativeModule)
		{
			ModuleMetadata.nativeModule = new ModuleMetadata(
				context,
				ts.factory.createSourceFile(
					[],
					ts.factory.createToken(ts.SyntaxKind.EndOfFileToken
					),
					ts.NodeFlags.None
				)
			);
		}

		return ModuleMetadata.nativeModule;
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
	 */
	addType(type: ts.Type): boolean
	{
		let existingProperties = this.types.get(type);

		if (existingProperties !== undefined)
		{
			return false;
		}

		const typeInfo: TypeInfo = {
			properties: undefined
		};

		this.types.set(type, typeInfo);
		typeInfo.properties = getTypeProperties(type, this.context.currentSourceFileContext!.context);

		return true;
	}

	private gatherModuleProperties(): ModuleMetadataProperties
	{
		const name = this.sourceFile.moduleName === undefined ? "" : this.sourceFile.moduleName;

		return {
			name,
			id: getSourceFileId(this.sourceFile),
			path: this.sourceFile.fileName,
			children: this.getChildrenReferences(this.sourceFile)
		};
	}

	private getChildrenReferences(sourceFile: ts.SourceFile)
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

			const sourceFileContext = this.context.currentSourceFileContext!;
			const childSourceFile = getSourceFile(importDeclaration, this.context);

			if (childSourceFile)
			{
				references.push(getSourceFileId(childSourceFile));
			}
			else
			{
				sourceFileContext.log.error(`SourceFile of module '${importDeclaration.moduleSpecifier.getText()}' `
					+ `not found.\r\n\tAt ${getNodeLocationText(importDeclaration)}`);
			}
		}

		return references;
	}
}