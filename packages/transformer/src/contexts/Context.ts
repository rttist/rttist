import type { CallsiteReferenceFactory }      from "../declarations/callsites";
import type { TransformerVisitor }            from "../declarations/general";
import * as ts                                from "typescript";
import { Logger }                             from "../logging";
import { MetadataLibrary }                    from "../metadata/MetadataLibrary";
import { getNodeLocationText }                from "../tracers/getNodeLocationText";
import { directTypeCallsiteReferenceFactory } from "../utils/directTypeCallsiteReferenceFactory";
import { TransformerContext }                 from "./TransformerContext";

/**
 * Context of visitors
 */
export class Context
{
	public readonly metadata: MetadataLibrary;
	public readonly transformationContext: ts.TransformationContext;
	public readonly program: ts.Program;
	public readonly typeChecker: ts.TypeChecker;
	public readonly transformerContext: TransformerContext;
	public readonly log: Logger;
	public readonly node: ts.Node;
	public readonly parent?: Context;
	public readonly visitor: ts.Visitor;


	// private readonly _sourceFileContext: SourceFileContext;
	private readonly _callsiteReferenceFactory: CallsiteReferenceFactory;

	// /**
	//  * When visiting declaration bodies, names of generic types used in getType() are inserted into this array.
	//  */
	// public usedGenericParameters: Array<string> = [];

	get config()
	{
		return this.transformerContext.config;
	}

	get callsiteReferenceFactory(): CallsiteReferenceFactory
	{
		return this._callsiteReferenceFactory;
	}

	constructor(
		parent: Context | undefined,
		transformerContext: TransformerContext,
		transformationContext: ts.TransformationContext,
		node: ts.Node,
		visitor: TransformerVisitor
	)
	{
		this.log = new Logger(getNodeLocationText(node));
		this.node = node;
		this.parent = parent;
		this.transformerContext = transformerContext;
		this.transformationContext = transformationContext;
		this.program = transformerContext.program;
		this.typeChecker = transformerContext.typeChecker;
		this.metadata = transformerContext.metadata;
		this.visitor = (node: ts.Node) => visitor(node, this);
		this._callsiteReferenceFactory = /*callsiteReferenceFactory ?? */directTypeCallsiteReferenceFactory;
	}

	visitWithCurrentContext(node: ts.Node): ts.VisitResult<ts.Node>
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

	// visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclarationBase): void
	// {
	// 	ts.visitEachChild(node, this.visitor, this._sourceFileContext.transformationContext);
	// }

	visitWithNewContext(node: ts.Node, visitor: TransformerVisitor): ts.Node
	{
		const context = new Context(this, this.transformerContext, this.transformationContext, node, visitor);

		return ts.visitEachChild(
			node,
			context.visitor,
			context.transformationContext
		);
	}

	get currentSourceFile(): ts.SourceFile
	{
		let node: ts.Node | undefined = this.node;

		while (node)
		{
			if (ts.isSourceFile(node))
			{
				return node;
			}

			node = this.parent?.node;
		}

		throw new Error("No SourceFile found in contexts.");
	}
}
