import * as ts                      from "typescript";
import { Context }                  from "../contexts/Context";
import { TransformerContext }       from "../contexts/TransformerContext";
import { TransformerTypeReference } from "../declarations/general";
import {
	getSourceFile
}                                   from "../utils/symbolHelpers";
import { getSymbol }           from "../utils/typeHelpers";
import { MetadataNodeFactory } from "./MetadataNodeFactory";
import { ModuleMetadata }      from "./ModuleMetadata";

const InstanceKey: symbol = Symbol.for("tst-reflect.MetadataLibrary");
let instance: MetadataLibrary = (global as any)[InstanceKey] || null;

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

		this.nodeFactory = new MetadataNodeFactory(this, context);
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
	 * Add type into the module metadata and return its properties.
	 * @param type
	 * @param typeNode
	 * @param context
	 */
	addType(type: ts.Type, typeNode: ts.TypeNode | undefined, context: Context): TransformerTypeReference
	{
		// type ??= this.context.checker.getTypeAtLocation(typeNode);
		const symbol = getSymbol(type, context);
		const sourceFile = symbol && getSourceFile(symbol);//typeNode?.getSourceFile() ?? getDeclaration(type.symbol)?.getSourceFile();

		let existingModule = sourceFile ? this.modules.get(sourceFile) : ModuleMetadata.getUnknownTypesModule(this.context);

		if (!existingModule)
		{
			existingModule = new ModuleMetadata(this.context, sourceFile!);
			this.modules.set(sourceFile!, existingModule);
		}

		const typeRef = existingModule.addType(type);
		const sourceFileContext = this.context.currentSourceFileContext;

		if (typeof typeRef === "string" && sourceFileContext)
		{
			let typeRefs = this.sourceFileContextTypes.get(sourceFileContext.sourceFile);

			if (!typeRefs)
			{
				typeRefs = [];
				this.sourceFileContextTypes.set(sourceFileContext.sourceFile, typeRefs);
			}

			typeRefs.push(typeRef);
		}

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