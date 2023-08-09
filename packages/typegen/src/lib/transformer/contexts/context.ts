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
	public readonly visitor: ts.Visitor;

	get config() {
		return this.transformerContext.config;
	}

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

	visitWithCurrentContext(node: ts.Node): ts.VisitResult<ts.Node> {
		return this.visitor(node) as ts.VisitResult<ts.Node>;
	}

	visitWithNewContext(node: ts.Node, visitor: TransformerVisitor): ts.Node {
		const context = new Context(
			this,
			this.transformerContext,
			this.transformationContext,
			this.sourceFileContext,
			node,
			visitor
		);

		return ts.visitEachChild(node, context.visitor, context.transformationContext);
	}

	get currentSourceFile(): ts.SourceFile {
		let node: ts.Node | undefined = this.node;

		while (node) {
			if (ts.isSourceFile(node)) {
				return node;
			}

			node = this.parent?.node;
		}

		throw new Error("No SourceFile found in contexts.");
	}
}
