import * as ts from "typescript";
import { Config } from "../config/config";
import { toExpression } from "../transformer/utils/to-expression";
import { ModuleMetadata } from "./module-metadata";

export class MetadataPrinter {
	private readonly printer = ts.createPrinter({});

	constructor(private readonly config: Config) {}

	/**
	 * Create TypeScript metadata registrar.
	 * @param metadata
	 */
	printMetadata(metadata: ModuleMetadata) {
		const sourceFile = this.createMetadataSourceFile(metadata);
		return this.printer.printFile(sourceFile);
	}

	private createMetadataSourceFile(moduleMetadata: ModuleMetadata): ts.SourceFile {
		/*
		export function add(library: any, stripInternals: boolean) {
			library.addMetadata(
				{
					name: "",
					id: "...",
					children: [],
					types: [...],
				},
				stripInternals
			);
		}
 		*/

		return ts.factory.createSourceFile(
			[
				// > export function add(library: any, stripInternals: boolean) {
				ts.factory.createFunctionDeclaration(
					[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
					undefined,
					"add",
					undefined,
					[
						ts.factory.createParameterDeclaration(
							undefined,
							undefined,
							"library",
							undefined,
							ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
						),
						ts.factory.createParameterDeclaration(
							undefined,
							undefined,
							"stripInternals",
							undefined,
							ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
						),
					],
					undefined,
					ts.factory.createBlock([
						// > library.addMetadata({}, stripInternals);
						ts.factory.createExpressionStatement(
							ts.factory.createCallExpression(
								ts.factory.createPropertyAccessExpression(
									ts.factory.createIdentifier("library"),
									ts.factory.createIdentifier("addMetadata")
								),
								undefined,
								[
									toExpression(moduleMetadata.getModuleProperties(this.config), this.config),
									ts.factory.createIdentifier("stripInternals"),
								]
							)
						),
					])
				),
			],
			ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
			ts.NodeFlags.None
		);
	}
}
