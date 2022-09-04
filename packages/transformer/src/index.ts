import * as ts                      from "typescript";
import { TransformerContext }       from "./contexts/TransformerContext";
import { SourceFileVisitorFactory } from "./factories/SourceFileVisitorFactory";

export default function transform(program: ts.Program): ts.TransformerFactory<ts.SourceFile>
{
	TransformerContext.init(program);

	return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
	{
		const visitorFactory = new SourceFileVisitorFactory(context);
		const sourceFileVisitor = visitorFactory.create();
		
		return (node) => ts.visitNode(node, sourceFileVisitor);
	};
}
