export enum SymbolKind
{
	ES,
	Unique
}

export type SymbolMemberNameMetadata = { kind: SymbolKind, key: string }
export type MemberNameMetadata = string | number | SymbolMemberNameMetadata

export class MemberName
{
	public readonly name: string | number | symbol;

	constructor(initializer: MemberNameMetadata)
	{
		if (typeof initializer === "object")
		{
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
		return this.name.toString();
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
