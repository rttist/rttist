import * as ts                      from "typescript";
import { TransformerContext }       from "./contexts/TransformerContext";
import { SourceFileVisitorFactory } from "./factories/SourceFileVisitorFactory";

export default function transform(program: ts.Program): ts.TransformerFactory<ts.SourceFile>
{
	TransformerContext.init(program);

	// const roots = program.getRootFileNames();
	// console.log("!!!!!!! INIT, roots:", roots.length);
	// console.log(roots);

	return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
	{
		const visitorFactory = new SourceFileVisitorFactory(context);

		return (sourceFileNode) => {
			
			// TODO: Remove this, because transformer is never called for external files anyway
			// Skip if it is external SourceFile
			if (program.isSourceFileFromExternalLibrary(sourceFileNode))
			{
				console.log("!!!!! External source file !!!!!!!!!!!!!!!!!");
				return sourceFileNode;
			}

			return ts.visitNode(sourceFileNode, visitorFactory.create());
		};
	};
}
