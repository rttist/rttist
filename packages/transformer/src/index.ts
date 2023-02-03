import * as ts                             from "typescript";
import { Config }                          from "./config/Config";
import { OptionalConfigReflectionSection } from "./config/ConfigReflectionSection";
import { TransformerContext }              from "./contexts/TransformerContext";
import { MetadataSource }                  from "./declarations/TypeProperties";
import { Logger }                          from "./logging";
import { DefaultPlugin }                   from "./plugins";
import { createSourceFileVisitor }         from "./visitors/sourceFileVisitor";

export default function transform(
	program: ts.Program,
	configParams?: { reflection?: OptionalConfigReflectionSection }
): ts.TransformerFactory<ts.SourceFile>
{
	// If the transformerFactory is called more than once, it means the program has been modified before finish.
	// We modify the Program because of emit() of typelib, so it will only occurs for typelib file.
	// In other cases we don't know what happened, so we just return our typelib sourcefile visitor.
	if (TransformerContext.initiated)
	{
		return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
		{
			return sourceFile => {
				if (sourceFile.fileName == TransformerContext.instance.config.metadataTypelibSourcePath.replace(/\\/g, "/")) {
					const modules = Array.from(TransformerContext.instance.metadata.getModules())
						.map(moduleMetadata => moduleMetadata.getModuleProperties());
					const source: MetadataSource = { modules };
					
					return TransformerContext.instance.metadataManager.libraryFileEmitter.updateTypeLibSourceFile(sourceFile, source);
				}
				
				return sourceFile;
			}
		};
	}

	// Create configuration object
	const config = new Config(program, configParams?.reflection || {});


	// Add typelib to filenames.
	config.parsedCommandLine?.fileNames.push(config.metadataTypelibSourcePath);

	// Add default plugin
	config.plugins.unshift(new DefaultPlugin());

	// Set logging level
	Logger.setLevel(config.logLevel);

	// Initiate global TransformerContext
	TransformerContext.init(program, config);

	return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
	{
		return createSourceFileVisitor(context);
	};
}
