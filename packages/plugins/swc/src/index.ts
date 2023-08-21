import { visit } from "woodpile";
import { parseSync, CallExpression, Compiler, Identifier, Expression, HasSpan, Span } from "@swc/core";

const perfStart = performance.now();

const ast = parseSync(
	`
import { Type } from "rttist";
import { getType } from "./metadata.typelib";

getType<any>();
getType<unknown>();
getType<undefined>();
getType<null>();
getType<void>();

// console.log("any", getType<any>().toString());
// console.log("unknown", getType<unknown>().toString());
// console.log("undefined", getType<undefined>().toString());
// console.log("null", getType<null>().toString());
// console.log("void", getType<void>().toString());
`,
	{
		syntax: "typescript",
		tsx: false, // set TRUE if the file is a TSX file
	}
);

const perfParsed = performance.now();

function createCallsite(node: CallExpression) {}

visit(ast, {
	visit: {
		visitCallExpr: ((node: CallExpression, self: Record<string, any>) => {
			node.callee = {
				type: "Identifier",
				span: (node.callee as HasSpan).span,
				// span: {
				// 	start: 0,
				// 	end: 0,
				// 	ctxt: 0,
				// },
				value: "hasType",
				optional: false,
			} satisfies Identifier;
			return node;
			// return {
			// 	type: "CallExpression",
			// } satisfies CallExpression;

			/*
			{
			  "type": "CallExpression",
			  "span": {
				"start": 80,
				"end": 94,
				"ctxt": 0
			  },
			  "callee": {
				"type": "Identifier",
				"span": {
				  "start": 80,
				  "end": 87,
				  "ctxt": 2
				},
				"value": "getType",
				"optional": false
			  },
			  "arguments": [],
			  "typeArguments": {
				"type": "TsTypeParameterInstantiation",
				"span": {
				  "start": 87,
				  "end": 92,
				  "ctxt": 0
				},
				"params": [
				  {
					"type": "TsKeywordType",
					"span": {
					  "start": 88,
					  "end": 91,
					  "ctxt": 0
					},
					"kind": "any"
				  }
				]
			  }
			}
			 */

			return createCallsite(node);
			// console.log("visitCallExpr", node);
			// return;
		}) as any,
		visitProgram: (node, self) => {
			console.log("visitProgram", node);
		},
		visitExpr: (node) => {
			// console.log("visitExpr", node);
		},
	},
});

const perfVisited = performance.now();

const compiler = new Compiler();
const result = compiler.printSync(ast);
const perfStop = performance.now();
console.log("Parsed time:", perfParsed - perfStart, "ms");
console.log("Visited time:", perfVisited - perfStart, "ms");
console.log("Total time:", perfStop - perfStart, "ms");
console.log(result.code);
