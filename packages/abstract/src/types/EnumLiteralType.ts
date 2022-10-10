import type { EnumLiteralTypeMetadata } from "../declarations";
import type { EnumType }                from "./EnumType";
import { TypeKind }                     from "../enums";
import { Type }                         from "../Type";
import { LazyType }                     from "../utils/LazyType";

export type StringEnumLiteralType = Omit<EnumLiteralType, "value"> & { value: string };
export type NumberEnumLiteralType = Omit<EnumLiteralType, "value"> & { value: number };

export class EnumLiteralType extends Type
{
	private readonly enumRef: LazyType<EnumType>;
	public readonly value: any;

	constructor(initializer: EnumLiteralTypeMetadata)
	{
		super(initializer);
		this.value = this.parseValue(initializer.value);
		this.enumRef = new LazyType<EnumType>(initializer.enum);
	}

	isStringLiteral(): this is StringEnumLiteralType
	{
		return this._kind === TypeKind.StringLiteral;
	}

	isNumberLiteral(): this is NumberEnumLiteralType
	{
		return this._kind === TypeKind.NumberLiteral;
	}

	private parseValue(value: any): any
	{
		switch (this._kind)
		{
			case TypeKind.StringLiteral:
				return value + "";
			case TypeKind.NumberLiteral:
				return Number(value);
		}

		return value;
	}
}