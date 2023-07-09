import * as ts                             from "typescript";
import { Config }                          from "./config/Config";
import { OptionalConfigReflectionSection } from "./config/ConfigReflectionSection";
import { TransformerContext }              from "./contexts/TransformerContext";
import {
	log,
	LogColor,
	Logger,
	LogLevel
}                                          from "./logging";
import { DefaultPlugin }                   from "./plugins";
import { createSourceFileVisitor }         from "./visitors/sourceFileVisitor";

export default function transform(
	program: ts.Program,
	configParams?: { reflection?: OptionalConfigReflectionSection }
): ts.TransformerFactory<ts.SourceFile>
{
	return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
	{
		// Create configuration object
		const config = new Config(program, configParams?.reflection || {});

		// Add default plugin
		config.plugins.unshift(new DefaultPlugin());

		// Set logging level
		Logger.setLevel(config.logLevel);

		// Log detected project root
		log.log(LogLevel.Info, LogColor.blue, "Detected project root: " + config.projectDir);

		// Initiate TransformerContext
		const transformerContext = new TransformerContext(program, config);

		return createSourceFileVisitor(context, transformerContext);
	};
}
