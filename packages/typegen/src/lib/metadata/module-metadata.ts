import type { ModuleIdentifier, TypeIdentifier } from "rttist";
import { TargetPlatform } from "../../declarations/target-platform";
import type { TypeInfo } from "../../declarations/type-info";
import type { ModuleMetadataProperties, ModuleProperties } from "../../declarations/type-properties";
import * as ts from "typescript";
import { ModuleIds } from "@rttist/core";
import { Config } from "../config/config";
import { ModuleScope } from "../transformer/syntax-type-checker/scopes/module-scope";

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
	});

	/**
	 * Module for invalid types.
	 * @private
	 */
	public static Invalid = new ModuleMetadata({
		id: ModuleIds.Invalid,
		name: "",
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
	 * @param scope
	 */
	public static createFromSourceFile(sourceFile: ts.SourceFile, config: Config, scope: ModuleScope): ModuleMetadata {
		const name = sourceFile.moduleName === undefined ? "" : sourceFile.moduleName;

		return new ModuleMetadata({
			name,
			id: scope.id,
			path: (config.target === TargetPlatform.Server && sourceFile.fileName) || undefined,
			children: scope.getImportedModuleIdentifiers(), //this.getChildrenReferences(sourceFile, config),
		});
	}

	/**
	 * Returns properties of this module.
	 */
	getModuleProperties(
		config: Config,
		{ withoutTypes = false }: { withoutTypes?: boolean } = { withoutTypes: false }
	): ModuleProperties {
		return {
			...this.moduleProperties,
			types: withoutTypes ? undefined : Array.from(this.types.values()).map((typeInfo) => typeInfo.properties!),
		};
	}

	/**
	 * Try to add type to the module metadata. Returns true if type was added, false if type was included already.
	 * @param typeInfo
	 */
	addType(typeInfo: TypeInfo): void {
		this.types.set(typeInfo.typeReference.id, typeInfo);

		// TODO: Uncomment when implemented in ID
		// if (typeInfo.nullable) {
		// 	typeInfo.properties.nullable = true;
		// }
	}

	// private static getChildrenReferences(sourceFile: ts.SourceFile, config: Config) {
	// 	const index = sourceFile.statements.findIndex((s) => !ts.isImportDeclaration(s));
	// 	const references: Array<ModuleReference> = [];
	// 	let importDeclaration: ts.ImportDeclaration;
	//
	// 	for (let i = 0; i < index; i++) {
	// 		importDeclaration = sourceFile.statements[i] as ts.ImportDeclaration;
	//
	// 		if (importDeclaration.importClause?.isTypeOnly) {
	// 			continue;
	// 		}
	//
	// 		references.push(generateImportedModuleId(sourceFile.fileName, importDeclaration, config));
	// 	}
	//
	// 	return references;
	// }
}
