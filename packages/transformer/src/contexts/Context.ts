import * as ts                                from "typescript";
import type { CallsiteReferenceFactory }      from "../declarations/callsites";
import type { TransformerVisitor }            from "../declarations/general";
import { directTypeCallsiteReferenceFactory } from "../utils/directTypeCallsiteReferenceFactory";
import type { SourceFileContext }             from "./SourceFileContext";

/**
 * Context of visitors
 */
export class Context
{
	private readonly _sourceFileContext: SourceFileContext;
	private readonly _visitor: ts.Visitor;
	private readonly _callsiteReferenceFactory: CallsiteReferenceFactory;

	/**
	 * When visiting declaration bodies, names of generic types used in getType() are inserted into this array.
	 */
	public usedGenericParameters: Array<string> = [];

	get metadata()
	{
		return this._sourceFileContext.metadata;
	}

	get log()
	{
		return this._sourceFileContext.log;
	}

	get config()
	{
		return this._sourceFileContext.transformerContext.config;
	}

	get visitor(): ts.Visitor
	{
		return this._visitor;
	}

	get callsiteReferenceFactory(): CallsiteReferenceFactory
	{
		return this._callsiteReferenceFactory;
	}

	get transformationContext(): ts.TransformationContext
	{
		return this._sourceFileContext.transformationContext;
	}

	get typeChecker(): ts.TypeChecker
	{
		return this._sourceFileContext.checker;
	}

	get program(): ts.Program
	{
		return this._sourceFileContext.program;
	}

	constructor(
		sourceFileContext: SourceFileContext,
		visitor: TransformerVisitor,
		callsiteReferenceFactory?: CallsiteReferenceFactory
	)
	{
		this._sourceFileContext = sourceFileContext;
		this._visitor = (node: ts.Node) => visitor(node, this);
		this._callsiteReferenceFactory = callsiteReferenceFactory ?? directTypeCallsiteReferenceFactory;
	}

	visit(node: ts.Node): ts.VisitResult<ts.Node>
	{
		return this.visitor(node);
	}

	// addTypeMetadata(metadataEntry: MetadataEntry)
	// {
	// 	this._sourceFileContext.typesMetadata.push(metadataEntry);
	// }
	//
	// addTypeCtor(ctorDescription: ts.PropertyAccessExpression)
	// {
	// 	if (this._sourceFileContext.typesCtors.indexOf(ctorDescription) === -1)
	// 	{
	// 		this._sourceFileContext.typesCtors.push(ctorDescription);
	// 	}
	// }

	visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclarationBase): void
	{
		ts.visitEachChild(node, this.visitor, this._sourceFileContext.transformationContext);
	}

	createNestedContext<TReturn = undefined>(
		visitor: TransformerVisitor,
		callsiteReferenceFactory: CallsiteReferenceFactory | undefined,
		contextAction: (context: Context) => TReturn
	): TReturn
	{
		const context = new Context(this._sourceFileContext, visitor, callsiteReferenceFactory);
		return contextAction(context);
	}

	get currentSourceFile(): ts.SourceFile
	{
		return this._sourceFileContext.sourceFile;
	}

	// /**
	//  * Get the metadata library writer handler
	//  */
	// get metaWriter(): IMetadataWriter
	// {
	// 	return this._sourceFileContext.metaWriter;
	// }
}
