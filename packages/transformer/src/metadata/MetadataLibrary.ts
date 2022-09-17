import { TypeIdentifier }            from "@rttist/abstract";
import * as ts                       from "typescript";
import { Context }                   from "../contexts/Context";
import { TransformerContext }        from "../contexts/TransformerContext";
import { TransformerTypeReference }  from "../declarations/general";
import { TypeProperties }            from "../declarations/TypeProperties";
import { getSourceFile }             from "../utils/symbolHelpers";
import { getTypeSourceLocationText } from "../utils/traceHelpers";
import {
	getSymbol,
	getTypeRef
}                                    from "../utils/typeHelpers";
import { MetadataNodeFactory }       from "./MetadataNodeFactory";
import { ModuleMetadata }            from "./ModuleMetadata";
import { PackageMetadata }           from "./PackageMetadata";

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
	private readonly modules = new Map<ts.SourceFile, ModuleMetadata>();

	/**
	 * Metadata factory.
	 */
	public readonly nodeFactory: MetadataNodeFactory;

	/**
	 * Map of types used in which SourceFile.
	 * @private
	 */
	private readonly sourceFileContextTypes = new Map<ts.SourceFile, TransformerTypeReference[]>();

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

	// /**
	//  * Metadata writer.
	//  */
	// public readonly writer: IMetadataWriter;

	/**
	 * @protected
	 */
	protected constructor(private readonly context: TransformerContext)
	{
		if (new.target != Activator)
		{
			throw new Error("This constructor is protected.");
		}

		this.nodeFactory = new MetadataNodeFactory();
		// this.writer = MetadataWriterFactory.create(context);
	}

	// /**
	//  * Get singleton instance of MetadataLibrary.
	//  */
	// static get instance(): MetadataLibrary
	// {
	// 	if (!instance)
	// 	{
	// 		throw new Error("tst-reflect: MetadataLibrary hasn't been initiated yet!");
	// 	}
	//
	// 	return instance;
	// }

	/**
	 * Init Metadata library.
	 * @param context
	 */
	static init(context: TransformerContext)
	{
		if (!instance)
		{
			instance = Reflect.construct(MetadataLibrary, [context], Activator) as MetadataLibrary;
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
		const typeRef = getTypeRef(type, context.typeChecker);

		// Native type or already processed type
		if (typeof typeRef !== "string" || this.processedTypes.has(typeRef))
		{
			return typeRef;
		}

		const typeInfo: TypeInfo = {};
		this.processedTypes.set(typeRef, typeInfo);

		// ts.isExternalModule()
		// context.program.isSourceFileFromExternalLibrary()

		// type ??= this.context.checker.getTypeAtLocation(typeNode);
		const symbol = getSymbol(type, context.typeChecker);
		const sourceFile = symbol && getSourceFile(symbol);//typeNode?.getSourceFile() ?? getDeclaration(type.symbol)?.getSourceFile();

		if (!sourceFile)
		{
			context.log.warn("Unable to access SourceFile of type." + getTypeSourceLocationText(type, context));
			return typeRef;
		}

		let existingModule = this.modules.get(sourceFile);
		// let existingModule = sourceFile ? this.modules.get(sourceFile) : ModuleMetadata.getUnknownModule(this.context);

		if (!existingModule)
		{
			existingModule = ModuleMetadata.createFromSourceFile(sourceFile, context);
			this.modules.set(sourceFile!, existingModule);
		}

		// Add type to Module
		const properties = existingModule.addType(type);

		if (properties !== false)
		{
			typeInfo.properties = properties;
		}


		// const sourceFileContext = this.context.currentSourceFileContext;
		//
		// if (typeof typeRef === "string" && sourceFileContext)
		// {
		// 	let typeRefs = this.sourceFileContextTypes.get(sourceFileContext.sourceFile);
		//
		// 	if (!typeRefs)
		// 	{
		// 		typeRefs = [];
		// 		this.sourceFileContextTypes.set(sourceFileContext.sourceFile, typeRefs);
		// 	}
		//
		// 	typeRefs.push(typeRef);
		// }

		return typeRef;
	}

	/**
	 * Returns list of type references used inside given SourceFile.
	 * @param sourceFile
	 */
	getInFileTypes(sourceFile: ts.SourceFile): TransformerTypeReference[]
	{
		return this.sourceFileContextTypes.get(sourceFile) || [];
	}
}

class Activator extends MetadataLibrary
{
}