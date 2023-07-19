import * as ts from "typescript";
import { AccessModifier } from "rttist";

export function getModifiers(
	declaration: ts.Declaration | undefined,
	symbol?: ts.Symbol
): {
	access: AccessModifier;
	readonly: boolean;
	static: boolean;
} {
	const modifiers = {
		access: AccessModifier.Public,
		readonly: false,
		static: false,
	};

	if (declaration && ts.canHaveModifiers(declaration)) {
		const kinds = ts.getModifiers(declaration)?.map((m) => m.kind) ?? [];

		if (kinds.includes(ts.SyntaxKind.PrivateKeyword)) {
			modifiers.access = AccessModifier.Private;
		} else if (kinds.includes(ts.SyntaxKind.ProtectedKeyword)) {
			modifiers.access = AccessModifier.Protected;
		} else if (kinds.includes(ts.SyntaxKind.ReadonlyKeyword)) {
			modifiers.readonly = true;
		} else if (kinds.includes(ts.SyntaxKind.StaticKeyword)) {
			modifiers.static = true;
		}

		if (symbol?.name.charAt(0) === "#") {
			modifiers.access = AccessModifier.Private;
		}
	}

	return modifiers;
}
