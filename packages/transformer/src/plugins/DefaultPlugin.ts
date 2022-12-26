import * as ts                from "typescript";
import { createImport }       from "../ast-utils/createImport";
import { TransformerContext } from "../contexts/TransformerContext";
import { MetadataSource }     from "../declarations/TypeProperties";
import { log }                from "../logging";
import { toExpression }       from "../utils/toExpression";
import { MetadataContext }    from "./MetadataContext";
import {
	Plugin
}                             from "./Plugin";

export class DefaultPlugin implements Plugin
{
	private readonly tstReflectIdentifier: ts.Identifier;

	constructor()
	{
		this.tstReflectIdentifier = ts.factory.createIdentifier("tstReflect");
	}

	/**
	 * @inheritDoc
	 */
	getImports?(): Array<ts.ImportDeclaration | ts.VariableStatement>
	{
		// In case the encoding is enabled, import tst-reflect runtime which is able to decode it.
		// Otherwise we'll use rttist directly.
		if (TransformerContext.instance.config.encode)
		{
			return [
				createImport(this.tstReflectIdentifier, "tst-reflect")
			];
		}

		return [];
	}

	/**
	 * @inheritDoc
	 */
	createModuleRegistrars?(metadata: MetadataSource, context: MetadataContext): ts.Statement[]
	{
		if (TransformerContext.instance.config.encode)
		{
			log.warn("Implementation of the metadata encoding is not finished yet.");

			// const fncExpression = ts.factory.createPropertyAccessExpression(this.tstReflectIdentifier, "loadEncodedModule");
			//
			// return metadata.modules.map(moduleMetadata => ts.factory.createExpressionStatement(
			// 	ts.factory.createCallExpression(fncExpression, undefined, [
			// 		toExpression(moduleMetadata)
			// 	])
			// ));
		}

		const addModuleExpression = ts.factory.createPropertyAccessExpression(context.metadataIdentifier, "addModule");

		return metadata.modules.map(moduleMetadata => ts.factory.createExpressionStatement(
			ts.factory.createCallExpression(addModuleExpression, undefined, [
				ts.factory.createNewExpression(
					context.moduleClassIdentifier,
					undefined,
					[
						toExpression(moduleMetadata)
					]
				)
			])
		));
	}
}