import type { Config }              from "../config/Config";
import type { Context }             from "../contexts/Context";
import type { TypeInfo }            from "../declarations/general";
import type {
	ModuleMetadataProperties,
	ModuleProperties,
	TypePropertiesWithId
}                                   from "../declarations/TypeProperties";
import type {
	ModuleIdentifier,
	ModuleReference,
	TypeIdentifier
}                                   from "rttist";
import path                         from "path";
import { ModuleIds }                from "@rttist/core";
import * as ts                      from "typescript";
import { log }                      from "../logging";
import { getTypeProperties }        from "../properties/getTypeProperties";
import { getNodeLocationText }      from "../tracers/getNodeLocationText";
import { changeExtensionForOutput } from "../utils/changeExtensionForOutput";
import { getSourceFile }            from "../utils/findSourceFile";
import { getRelativePath }          from "../utils/getRelativePath";
import { getSourceFileId }          from "../utils/getSourceFileId";

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
	 * @param context
	 */
	public static createFromSourceFile(sourceFile: ts.SourceFile, context: Context): ModuleMetadata
	{
		const name = sourceFile.moduleName === undefined ? "" : sourceFile.moduleName;

		return new ModuleMetadata(
			{
				name,
				id: getSourceFileId(sourceFile, context.transformerContext),
				path: sourceFile.fileName,
				children: this.getChildrenReferences(sourceFile, context)
			}
		);
	}

	/**
	 * Returns properties of this module.
	 */
	getModuleProperties(
		config: Config,
		{ withoutTypes = false }: { withoutTypes?: boolean } = { withoutTypes: false }
	): ModuleProperties
	{
		const modulePath = changeExtensionForOutput(
			getRelativePath(
				path.dirname(config.metadataTypelibSourcePath),
				this.moduleProperties.path
			),
			config
		);

		return {
			...this.moduleProperties,
			import: (
				this.moduleProperties.id === ModuleIds.Native
				|| this.moduleProperties.id === ModuleIds.Invalid
				|| this.moduleProperties.id === ModuleIds.Dynamic
			)
				? undefined
				: ts.factory.createArrowFunction(
					undefined,
					undefined,
					[],
					undefined,
					undefined,
					ts.factory.createCallExpression(
						ts.factory.createIdentifier("import"),
						undefined,
						[
							ts.factory.createStringLiteral(
								changeExtensionForOutput(modulePath, config)
							)
						]
					)
				),
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
		context.log.trace("Adding type", typeInfo.typeReference.id, "to", this.moduleProperties.id);

		this.types.set(typeInfo.typeReference.id, typeInfo);

		typeInfo.properties = getTypeProperties(typeInfo.type, symbol, context) as TypePropertiesWithId;
		typeInfo.properties!.id = typeInfo.typeReference.id;

		// TODO: Uncomment when implemented in ID
		// if (typeInfo.nullable)
		// {
		// 	typeInfo.properties!.nullable = true;
		// }
	}

	private static getChildrenReferences(sourceFile: ts.SourceFile, context: Context)
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

			const childSourceFile = getSourceFile(importDeclaration, context.transformerContext);

			if (childSourceFile)
			{
				references.push(getSourceFileId(childSourceFile, context.transformerContext));
			}
			else
			{
				log.ifWarn(() => [
					`SourceFile of child module '${importDeclaration.moduleSpecifier.getText()}' `
					+ `not found.\n\tAt ${getNodeLocationText(importDeclaration)}`
				]);
			}
		}

		return references;
	}
}