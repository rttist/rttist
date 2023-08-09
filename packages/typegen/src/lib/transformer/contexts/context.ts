import type { TransformerVisitor } from "../../../declarations/transformer-visitor";
import type { MetadataLibrary } from "../../metadata/metadata-library";
import type { TransformerContext } from "./transformer-context";
import * as ts from "typescript";
import { Logger } from "../../logging";
import { getNodeLocationText } from "../tracers/getNodeLocationText";
import { SourceFileContext } from "./source-file-context";

/**
 * Context of visitors
 */
export class Context {
	public readonly metadata: MetadataLibrary;
	public readonly transformationContext: ts.TransformationContext;
	public readonly program: ts.Program;
	public readonly typeChecker: ts.TypeChecker;
	public readonly transformerContext: TransformerContext;
	public readonly log: Logger;
	public readonly node: ts.Node;
	public readonly parent?: Context;
	public readonly visitor: (node: ts.Node) => void;

	constructor(
		parent: Context | undefined,
		transformerContext: TransformerContext,
		transformationContext: ts.TransformationContext,
		public readonly sourceFileContext: SourceFileContext,
		node: ts.Node,
		visitor: TransformerVisitor
	) {
		this.log = new Logger(getNodeLocationText(node));
		this.node = node;
		this.parent = parent;
		this.transformerContext = transformerContext;
		this.transformationContext = transformationContext;
		this.program = transformerContext.program;
		this.typeChecker = transformerContext.typeChecker;
		this.metadata = transformerContext.metadata;
		this.visitor = (node: ts.Node) => visitor(node, this);
	}

	visitEachChild(node: ts.Node) {
		ts.forEachChild(node, this.visitor);
	}

	visitWithNewContext(node: ts.Node, visitor: TransformerVisitor) {
		const context = new Context(
			this,
			this.transformerContext,
			this.transformationContext,
			this.sourceFileContext,
			node,
			visitor
		);

		ts.forEachChild(node, (node) => {
			context.visitor(node);
		});
	}
}
