import type { ModuleIdentifier, ModuleReference, TypeIdentifier } from "rttist";
import type { TypeInfo } from "../../declarations/type-info";
import type {
	ModuleMetadataProperties,
	ModuleProperties,
	TypePropertiesWithId,
} from "../../declarations/type-properties";
import * as ts from "typescript";
import { ModuleIds } from "@rttist/core";
import { Config } from "../config/config";
import { Context } from "../transformer/contexts/context";
import { generateImportedModuleId, generateSourceFileModuleId } from "../transformer/id-generators";
import { getTypeProperties } from "../transformer/properties/get-type-properties";

/**
 * Class containing metadata of one Module/SourceFile.
 */
export class ModuleMetadata {
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

	get id(): ModuleIdentifier {
		return this.moduleProperties.id;
	}

	/**
	 * @param properties
	 */
	constructor(properties: ModuleMetadataProperties) {
		this.moduleProperties = properties;
	}

	/**
	 * Create ModuleMetadata object from SourceFile.
	 * @param sourceFile
	 * @param config
	 */
	public static createFromSourceFile(sourceFile: ts.SourceFile, config: Config): ModuleMetadata {
		const name = sourceFile.moduleName === undefined ? "" : sourceFile.moduleName;

		return new ModuleMetadata({
			name,
			id: generateSourceFileModuleId(sourceFile.fileName, config.tsRootDir, config.packageInfo.name),
			path: sourceFile.fileName,
			children: this.getChildrenReferences(sourceFile, config),
		});
	}

	/**
	 * Returns properties of this module.
	 */
	getModuleProperties(
		config: Config,
		{ withoutTypes = false }: { withoutTypes?: boolean } = { withoutTypes: false }
	): ModuleProperties {
		// const modulePath = changeExtensionForOutput(
		// 	relativePath(path.dirname(config.metadataTypelibSourcePath), this.moduleProperties.path),
		// 	config
		// );

		return {
			...this.moduleProperties,
			// import:
			// 	this.moduleProperties.id === ModuleIds.Native ||
			// 	this.moduleProperties.id === ModuleIds.Invalid ||
			// 	this.moduleProperties.id === ModuleIds.Dynamic
			// 		? undefined
			// 		: ts.factory.createArrowFunction(
			// 				undefined,
			// 				undefined,
			// 				[],
			// 				undefined,
			// 				undefined,
			// 				ts.factory.createCallExpression(ts.factory.createIdentifier("import"), undefined, [
			// 					ts.factory.createStringLiteral(changeExtensionForOutput(modulePath, config)),
			// 				])
			// 		  ),
			types: withoutTypes ? undefined : Array.from(this.types.values()).map((typeInfo) => typeInfo.properties!),
		};
	}

	/**
	 * Try to add type to the module metadata. Returns true if type was added, false if type was included already.
	 * @param typeInfo
	 * @param symbol
	 * @param context
	 */
	addType(typeInfo: TypeInfo, symbol: ts.Symbol | undefined, context: Context): void {
		context.log.trace("Adding type", typeInfo.typeId, "to", this.moduleProperties.id);

		this.types.set(typeInfo.typeId, typeInfo);

		// TODO: Type properties
		typeInfo.properties = getTypeProperties(typeInfo.type, symbol, context) as TypePropertiesWithId;
		typeInfo.properties!.id = typeInfo.typeId;

		// TODO: Uncomment when implemented in ID
		// if (typeInfo.nullable)
		// {
		// 	typeInfo.properties!.nullable = true;
		// }
	}

	private static getChildrenReferences(sourceFile: ts.SourceFile, config: Config) {
		const index = sourceFile.statements.findIndex((s) => !ts.isImportDeclaration(s));
		const references: Array<ModuleReference> = [];
		let importDeclaration: ts.ImportDeclaration;

		for (let i = 0; i < index; i++) {
			importDeclaration = sourceFile.statements[i] as ts.ImportDeclaration;

			if (importDeclaration.importClause?.isTypeOnly) {
				continue;
			}

			references.push(
				generateImportedModuleId(sourceFile.fileName, importDeclaration.moduleSpecifier.toString(), config)
			);
		}

		return references;
	}
}
