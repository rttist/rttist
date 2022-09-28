import {
	ModuleIdentifier,
	TypeIdentifier
}                                   from "@rttist/abstract";
import * as ts                      from "typescript";
import { Context }                  from "../contexts/Context";
import { printTypeDebugInfo }       from "../debugs/printTypeDebugInfo";
import { TransformerTypeReference } from "../declarations/transformerTypeReference";
import { TypeProperties }           from "../declarations/TypeProperties";
import { DependencyManager }        from "../dependencies/DependencyManager";
import { getTypeRef }               from "../utils/typeHelpers";
import { MetadataNodeFactory }      from "./MetadataNodeFactory";
import { ModuleMetadata }           from "./ModuleMetadata";
import { PackageMetadata }          from "./PackageMetadata";

const InstanceKey: symbol = Symbol.for("tst-reflect.MetadataLibrary");
let instance: MetadataLibrary = (global as any)[InstanceKey] || null;

// TODO: Maybe remove this and just use PackageMetadata instead.
type PackageInfo = { name: string, metadata: PackageMetadata };

type TypeInfo = { properties?: TypeProperties };

export class MetadataLibrary
{
	/**
	 * Map of "touched" SourceFiles/Modules.
	 */
	private readonly modules = new Map<ModuleIdentifier, ModuleMetadata>([
		[ModuleMetadata.Native.id, ModuleMetadata.Native]
	]);

	/**
	 * Metadata factory.
	 */
	public readonly nodeFactory: MetadataNodeFactory;

	/**
	 * Manager of package dependencies.
	 */
	public readonly dependencyManager: DependencyManager;

	// /**
	//  * Map of types used in which SourceFile.
	//  * @private
	//  */
	// private readonly sourceFileContextTypes = new Map<ts.SourceFile, TransformerTypeReference[]>();

	// /**
	//  * Map of packages from project dependencies.
	//  * @desc Key is package name.
	//  * @private
	//  */
	// private readonly packagesMetadata = new Map<string, PackageInfo>();

	/**
	 * Set of already processed types.
	 */
	private readonly processedTypes = new Map<TypeIdentifier, TypeInfo>();

	/**
	 * @protected
	 */
	protected constructor(dependencyManager: DependencyManager)
	{
		if (new.target != Activator)
		{
			throw new Error("This constructor is protected.");
		}

		this.dependencyManager = dependencyManager;
		this.nodeFactory = new MetadataNodeFactory();
	}

	/**
	 * Init Metadata library.
	 * @param dependencyManager
	 */
	static init(dependencyManager: DependencyManager): MetadataLibrary
	{
		if (!instance)
		{
			instance = Reflect.construct(MetadataLibrary, [dependencyManager], Activator) as MetadataLibrary;
		}

		return instance;
	}

	/**
	 * Get all the modules generated to this time.
	 */
	getModules(): IterableIterator<ModuleMetadata>
	{
		return this.modules.values();
	}

	/**
	 * Add type to the metadata library, in case it is not there yet, and return reference to the type.
	 * @param type
	 * @param typeNode
	 * @param context
	 */
	referenceType(type: ts.Type, typeNode: ts.TypeNode | undefined, context: Context): TransformerTypeReference
	{
		// Get the type reference before further processing.
		const typeRef: TransformerTypeReference = getTypeRef(type, context.typeChecker);

		// Native type or already processed type
		if (
			typeRef.isNative()
			|| this.processedTypes.has(typeRef.id)
			// or it has custom typelib
			|| (
				typeRef.sourceFile
				&& this.dependencyManager.getDependencyInfo(typeRef.sourceFile.fileName)?.typelibPath
			))
		{
			return typeRef;
		}

		// Create TypeInfo and store it before adding to MetadataLibrary which gather types, 
		// so this will prevent recursive issues.
		const typeInfo: TypeInfo = {};
		this.processedTypes.set(typeRef.id, typeInfo);

		let existingModule = this.modules.get(typeRef.moduleIdentifier);

		if (!existingModule)
		{
			if (!typeRef.sourceFile)
			{
				context.log.warn(
					"Unable to access SourceFile of type."
					+ printTypeDebugInfo(type, context.typeChecker)
				);
				return typeRef;
			}

			existingModule = ModuleMetadata.createFromSourceFile(typeRef.sourceFile);
			this.modules.set(typeRef.moduleIdentifier, existingModule);
		}

		// Add type to Module
		const properties = existingModule.addType(type, context);

		if (properties !== false)
		{
			typeInfo.properties = properties;
		}

		return typeRef;
	}
}

class Activator extends MetadataLibrary
{
}