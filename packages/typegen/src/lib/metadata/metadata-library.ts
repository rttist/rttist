import type { TypeIdentifier } from "rttist";
import { TypeInfo } from "../../declarations/type-info";
import { TypePropertiesWithId } from "../../declarations/type-properties";
import type { Context } from "../transformer/contexts/context";
import * as ts from "typescript";
import { DependencyManager } from "../dependencies/dependency-manager";
import { getTypeProperties } from "../transformer/properties/get-type-properties";
import { TransformerTypeReference } from "./transformer-type-reference";

const InstanceKey: symbol = Symbol.for("tst-reflect.MetadataLibrary");
let instance: MetadataLibrary = (global as any)[InstanceKey] || null;

export class MetadataLibrary {
	// /**
	//  * Map of "touched" SourceFiles/Modules.
	//  */
	// private readonly modules = new Map<ModuleIdentifier, ModuleMetadata>([
	// 	[ModuleMetadata.Native.id, ModuleMetadata.Native],
	// 	[ModuleMetadata.Invalid.id, ModuleMetadata.Invalid]
	// ]);

	/**
	 * Manager of package dependencies.
	 */
	public readonly dependencyManager: DependencyManager;

	/**
	 * Set of already processed types.
	 */
	private readonly processedTypes = new Map<TypeIdentifier, TypeInfo>();

	/**
	 * @protected
	 */
	protected constructor(dependencyManager: DependencyManager) {
		if (new.target !== Activator) {
			throw new Error("This constructor is protected.");
		}

		this.dependencyManager = dependencyManager;
	}

	/**
	 * Init Metadata library.
	 * @param dependencyManager
	 */
	static init(dependencyManager: DependencyManager): MetadataLibrary {
		if (!instance) {
			instance = Reflect.construct(MetadataLibrary, [dependencyManager], Activator) as MetadataLibrary;
		}

		return instance;
	}

	/**
	 * Returns total number of processed types.
	 */
	getNumberOfTypes(): number {
		return this.processedTypes.size;
	}

	// /**
	//  * Returns total number of processed modules.
	//  */
	// getNumberOfModules(): number {
	// 	return this.modules.size;
	// }

	// /**
	//  * Get all the modules generated to this time.
	//  */
	// getModules(): IterableIterator<ModuleMetadata> {
	// 	return this.modules.values();
	// }

	/**
	 * Add type to the metadata library, in case it is not there yet, and return reference to the type.
	 * @param typeReference
	 * @param type
	 * @param nullable Type should be nullable. Eg. it is the type of OPTIONAL property or parameter.
	 * @param symbol Symbol which should be used to generate name of the type.
	 * Is used for TypeAliases and Anonymous types (variables and properties their assigned to gives them name).
	 * @param typeNode
	 * @param context
	 */
	generateMetadataForType(
		typeReference: TransformerTypeReference,
		type: ts.Type,
		nullable: boolean, // TODO: Implement
		symbol: ts.Symbol | undefined,
		typeNode: ts.TypeNode | undefined,
		context: Context
	) {
		// TODO: Implement properly! We do not want to generate properties for intrinsic types. But we have to handle generic types such as Array<SomeOfMyProjectTypes>.
		if (typeReference.id.charAt(0) === "#") {
			return {
				typeReference: typeReference,
				type: type,
				nullable: nullable,
				properties: {},
			};
		}

		const typeInfo: TypeInfo = {
			typeReference: typeReference,
			// transformerType: transformerType,
			// typeId: transformerType.id,
			type: type,
			nullable: nullable,
			properties: getTypeProperties(type, symbol, context) as TypePropertiesWithId,
		};
		typeInfo.properties!.id = typeInfo.typeReference.id;

		// Store TypeInfo before adding to MetadataLibrary which gather types, so this will prevent recursive issues.
		this.processedTypes.set(typeReference.id, typeInfo);

		// Add type to Module
		context.log.trace("Adding type", typeInfo.typeReference.id, "to", context.sourceFileContext.metadata.id);
		context.sourceFileContext.metadata.addType(typeInfo);

		return typeInfo;

		// return typeRef;
	}

	// /**
	//  * Get ModuleMetadata. Create if not exists yet.
	//  * @param typeRef
	//  * @param context
	//  * @param type
	//  */
	// private getModule(typeRef: TransformerTypeReference, context: Context, type: ts.Type): ModuleMetadata {
	// 	let existingModule = this.modules.get(typeRef.moduleIdentifier);
	//
	// 	if (!existingModule) {
	// 		if (!typeRef.sourceFile) {
	// 			context.log.ifWarn(() => [
	// 				"Unable to access SourceFile of type." + printTypeDebugInfo(type, context.typeChecker),
	// 			]);
	//
	// 			return ModuleMetadata.Invalid;
	// 			// return typeRef; // TODO: Test if we can do this -> do not return here but add it to Unknown module.
	// 		}
	//
	// 		existingModule = ModuleMetadata.createFromSourceFile(typeRef.sourceFile, context);
	// 		this.modules.set(typeRef.moduleIdentifier, existingModule);
	// 	}
	//
	// 	return existingModule;
	// }
}

class Activator extends MetadataLibrary {}
