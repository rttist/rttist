import { MetadataTypeValues }     from "../config-options";
import { TransformerContext }     from "../contexts/TransformerContext";
import { MetadataSource }         from "../declarations/TypeProperties";
import { log }                    from "../log";
import { MiddlewareResult }       from "../middlewares";
import { processMiddlewares }     from "../middlewares/processMiddlewares";
import { createValueExpression }  from "../utils/createValueExpression";
import { MetadataLibraryEmitter } from "./MetadataLibraryEmitter";

export class MetadataManager
{
	private transformerContext: TransformerContext;
	private metadataLibraryEmitter: MetadataLibraryEmitter;

	constructor(transformerContext: TransformerContext)
	{
		this.transformerContext = transformerContext;
		this.metadataLibraryEmitter = new MetadataLibraryEmitter();
	}

	emitMetadataLibrary()
	{

	}
}