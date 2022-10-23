import type { MemberNameMetadata } from "../declarations";
import { SymbolKind }              from "../enums";

export class MemberName
{
	public readonly name: string | number | symbol;
	public readonly key?: string;
	public readonly kind?: SymbolKind;

	constructor(initializer: MemberNameMetadata)
	{
		if (typeof initializer === "object")
		{
			this.key = initializer.key;
			this.kind = initializer.kind;

			if (initializer.kind === SymbolKind.ES)
			{
				this.name = (Symbol as any)[initializer.key];
				return;
			}
			this.name = Symbol.for(initializer.key);
			return;
		}

		this.name = initializer;
	}

	isString(): this is StringMemberName
	{
		return typeof this.name === "string";
	}

	isNumber(): this is NumberMemberName
	{
		return typeof this.name === "number";
	}

	isSymbol(): this is SymbolMemberName
	{
		return typeof this.name === "symbol";
	}

	toString(): string
	{
		return this.isSymbol() ? `Symbol.for('${this.key}')` : this.name.toString();
	}
}

export type StringMemberName = MemberName & {
	name: string;
}

export type NumberMemberName = MemberName & {
	name: number;
}

export type SymbolMemberName = MemberName & {
	name: symbol;
	key: string;
	kind: SymbolKind;
}
