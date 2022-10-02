import * as ts                      from "typescript";
import {
	ModuleIdentifier,
	TypeIdentifier
}                                   from "@rttist/abstract";
import { Context }                  from "../contexts/Context";
import { printTypeDebugInfo }       from "../debugs/printTypeDebugInfo";
import { TypeInfo }                 from "../declarations/general";
import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import { DependencyManager }        from "../dependencies/DependencyManager";
import { getTypeRef }               from "../utils/getTypeRef";
import { MetadataNodeFactory }      from "./MetadataNodeFactory";
import { ModuleMetadata }           from "./ModuleMetadata";

const InstanceKey: symbol = Symbol.for("tst-reflect.MetadataLibrary");
let instance: MetadataLibrary = (global as any)[InstanceKey] || null;

export class MetadataLibrary
{
	/**
	 * Map of "touched" SourceFiles/Modules.
	 */
	private readonly modules = new Map<ModuleIdentifier, ModuleMetadata>([
		[ModuleMetadata.Native.id, ModuleMetadata.Native],
		[ModuleMetadata.Invalid.id, ModuleMetadata.Invalid]
	]);

	/**
	 * Metadata factory.
	 */
	public readonly nodeFactory: MetadataNodeFactory;

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
	 * Returns total number of processed types.
	 */
	getNumberOfTypes(): number
	{
		return this.processedTypes.size;
	}

	/**
	 * Returns total number of processed modules.
	 */
	getNumberOfModules(): number
	{
		return this.modules.size;
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
	 * @param symbol Symbol which should be used to generate name of the type.
	 * Is used for TypeAliases and Anonymous types (variables and properties their assigned to gives them name).
	 * @param typeNode
	 * @param context
	 */
	referenceType(
		type: ts.Type,
		symbol: ts.Symbol | undefined,
		typeNode: ts.TypeNode | undefined,
		context: Context
	): TransformerTypeReference
	{
		// Get the type reference before further processing.
		const typeRef: TransformerTypeReference = getTypeRef(type, symbol, context.typeChecker);

		// If it's native type 
		if (
			typeRef.isKindOnly()
			// or already processed type
			|| this.processedTypes.has(typeRef.id)
			// or it external SourceFile with custom typelib.
			|| (
				typeRef.sourceFile
				&& this.dependencyManager.getDependencyInfo(typeRef.sourceFile.fileName)?.typelibPath
			))
		{
			return typeRef;
		}

		const typeInfo: TypeInfo = {
			typeReference: typeRef,
			type: type,
			properties: undefined
		};

		// Store TypeInfo it before adding to MetadataLibrary which gather types, so this will prevent recursive issues.
		this.processedTypes.set(typeRef.id, typeInfo);

		// Add type to Module
		this.getModule(typeRef, context, type)
			.addType(typeInfo, symbol, context);

		return typeRef;
	}

	/**
	 * Get ModuleMetadata. Create if not exists yet.
	 * @param typeRef
	 * @param context
	 * @param type
	 */
	private getModule(typeRef: TransformerTypeReference, context: Context, type: ts.Type): ModuleMetadata
	{
		let existingModule = this.modules.get(typeRef.moduleIdentifier);

		if (!existingModule)
		{
			if (!typeRef.sourceFile)
			{
				context.log.warn(
					"Unable to access SourceFile of type."
					+ printTypeDebugInfo(type, context.typeChecker)
				);

				return ModuleMetadata.Invalid;
				// return typeRef; // TODO: Test if we can do this -> do not return here but add it no Unknown module.
			}

			existingModule = ModuleMetadata.createFromSourceFile(typeRef.sourceFile);
			this.modules.set(typeRef.moduleIdentifier, existingModule);
		}

		return existingModule;
	}
}

class Activator extends MetadataLibrary
{
}