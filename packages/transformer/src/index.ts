import * as ts                             from "typescript";
import { Config }                          from "./config/Config";
import { OptionalConfigReflectionSection } from "./config/ConfigReflectionSection";
import { TransformerContext }              from "./contexts/TransformerContext";
import { SourceFileVisitorFactory }        from "./factories/SourceFileVisitorFactory";

export default function transform(program: ts.Program, config?: { reflection?: OptionalConfigReflectionSection }): ts.TransformerFactory<ts.SourceFile>
{
	TransformerContext.init(program, new Config(program, config?.reflection || {}));

	return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
	{
		const visitorFactory = new SourceFileVisitorFactory(context);

		return (sourceFileNode) => {
			// TODO: Is transformer even called for external library files?
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
