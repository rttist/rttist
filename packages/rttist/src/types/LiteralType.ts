import type { LiteralTypeMetadata } from "../declarations";
import { TypeKind }                 from "../enums";
import { Type }                     from "../Type";

export type StringLiteralType = Omit<LiteralType, "value"> & { value: string };
export type NumberLiteralType = Omit<LiteralType, "value"> & { value: number };
export type BooleanLiteralType = Omit<LiteralType, "value"> & { value: boolean };
export type BigIntLiteralType = Omit<LiteralType, "value"> & { value: BigInt };
export type RegExpLiteralType = Omit<LiteralType, "value"> & { value: RegExp };

export class LiteralType extends Type
{
	public readonly value: any;

	constructor(initializer: LiteralTypeMetadata)
	{
		super(initializer);
		this.value = this.parseValue(initializer.value);
	}

	isStringLiteral(): this is StringLiteralType
	{
		return this._kind === TypeKind.StringLiteral;
	}

	isNumberLiteral(): this is NumberLiteralType
	{
		return this._kind === TypeKind.NumberLiteral;
	}

	isBooleanLiteral(): this is BooleanLiteralType
	{
		return this._kind === TypeKind.True || this._kind === TypeKind.False;
	}

	isBigIntLiteral(): this is BigIntLiteralType
	{
		return this._kind === TypeKind.BigIntLiteral;
	}

	isRegExpLiteral(): this is RegExpLiteralType
	{
		return this._kind === TypeKind.RegExpLiteral;
	}

	/**
	 * Check if this type is a "true" literal.
	 */
	isTrue(): boolean
	{
		return this.kind === TypeKind.True;
	}

	/**
	 * Check if this type is a "false" literal.
	 */
	isFalse(): boolean
	{
		return this.kind === TypeKind.False;
	}

	private parseValue(value: any): any
	{
		switch (this._kind)
		{
			case TypeKind.StringLiteral:
				return value + "";
			case TypeKind.NumberLiteral:
				return Number(value);
			case TypeKind.False:
			case TypeKind.True:
				return value === "true" || value === true;
			case TypeKind.BigIntLiteral:
				return BigInt(value[value.length - 1] === "n" ? value.slice(0, -1) : value);
			case TypeKind.RegExpLiteral:
				return new RegExp(value);
		}

		return value;
	}
	
	toString(): string
	{
		return `${TypeKind[this._kind]}\(${this.value})`;
	}
}