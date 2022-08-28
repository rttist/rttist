import { ModuleReference }     from "@rtti/abstract";
import * as ts                 from "typescript";
import { TransformerContext }  from "../contexts/TransformerContext";
import {
	ModuleMetadataProperties,
	ModuleProperties,
	TransformerTypeReference,
	TypeProperties,
	UnknownTypeReference
} from "../declarations";
import { getTypeProperties }   from "../properties/getTypeProperties";
import { getSourceFile }       from "../utils/findSourceFile";
import { getNodeLocationText } from "../utils/traceHelpers";
// import { getCanonizedPathOfImportedModule } from "../utils/path";
import { getTypeId }           from "../utils/typeHelpers";

/**
 * Class containing metadata of one Module/SourceFile.
 */
export class ModuleMetadata
{
	/**
	 * Static counter of SourceFiles.
	 */
	private static sourceFileIdCounter = 1;

	/**
	 * Module for unknown types.
	 * @private
	 */
	private static unknownTypesModule?: ModuleMetadata;

	private readonly moduleProperties: ModuleMetadataProperties;
	private readonly types = new Map<ts.Type, TypeProperties>();
	private readonly typesStack: TransformerTypeReference[] = [];

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
	public static getUnknownTypesModule(context: TransformerContext): ModuleMetadata
	{
		if (!ModuleMetadata.unknownTypesModule)
		{
			ModuleMetadata.unknownTypesModule = new ModuleMetadata(
				context,
				ts.factory.createSourceFile(
					[],
					ts.factory.createToken(ts.SyntaxKind.EndOfFileToken
					),
					ts.NodeFlags.None
				)
			);
		}

		return ModuleMetadata.unknownTypesModule;
	}

	private static getSourceFileId(sourceFile: ts.SourceFile): number
	{
		return (sourceFile as any).__reflectId ?? (sourceFile as any).id ?? ((sourceFile as any).__reflectId = ModuleMetadata.sourceFileIdCounter++); // TODO: Check if sourcefile has "id"
	}

	/**
	 * Returns properties of this module.
	 */
	getModuleProperties({ withoutTypes = false }: { withoutTypes?: boolean } = { withoutTypes: false }): ModuleProperties
	{
		return {
			...this.moduleProperties,
			types: withoutTypes ? undefined : Array.from(this.types.values())
		};
	}

	/**
	 * Add type into the module metadata and return its properties.
	 * @param type
	 */
	addType(type: ts.Type): TransformerTypeReference
	{
		let existingProperties = this.types.get(type);

		if (!existingProperties)
		{
			const typeId = getTypeId(type);

			// Type is already in the stack (this type is circular).
			if (this.typesStack.includes(typeId))
			{
				return typeId;
			}

			this.typesStack.push(typeId);
			existingProperties = getTypeProperties(type, this.context.currentSourceFileContext!.context); // Change SourceFileContext to stack??  
			this.typesStack.pop();

			if (existingProperties.id === undefined)
			{
				return UnknownTypeReference; // TODO: Is correct?
			}

			this.types.set(type, existingProperties);
		}

		if (existingProperties.id === undefined)
		{
			return UnknownTypeReference; // TODO: Is correct?
		}

		return existingProperties.id;
	}

	private gatherModuleProperties(): ModuleMetadataProperties
	{
		const name = this.sourceFile.moduleName == undefined ? "" : this.sourceFile.moduleName;

		return {
			name,
			id: ModuleMetadata.getSourceFileId(this.sourceFile),
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
				references.push(ModuleMetadata.getSourceFileId(childSourceFile));
			}
			else
			{
				sourceFileContext.log.error(`SourceFile of module '${importDeclaration.moduleSpecifier.getText()}' not found.\r\n\tAt ${getNodeLocationText(importDeclaration)}`);
			}
		}

		return references;
	}
}