import * as ts                             from "typescript";
import { Config }                          from "./config/Config";
import { OptionalConfigReflectionSection } from "./config/ConfigReflectionSection";
import { TransformerContext }              from "./contexts/TransformerContext";
import { Logger }                          from "./logging";
import { createSourceFileVisitor }         from "./visitors/sourceFileVisitor";

export default function transform(
	program: ts.Program,
	configParams?: { reflection?: OptionalConfigReflectionSection }
): ts.TransformerFactory<ts.SourceFile>
{
	// Create configuration object
	const config = new Config(program, configParams?.reflection || {});
	
	// Set logging level
	Logger.setLevel(config.logLevel);
	
	// Initiate global TransformerContext
	TransformerContext.init(program, config);

	return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
	{
		return createSourceFileVisitor(context);
	};
}
