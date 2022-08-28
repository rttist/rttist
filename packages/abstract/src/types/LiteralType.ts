import type { LiteralTypeMetadata } from "../declarations";
import { TypeKind }                 from "../enums";
import { Type }                     from "../Type";

export class LiteralType extends Type
{
	public readonly value: any;

	constructor(initializer: LiteralTypeMetadata)
	{
		super(initializer);
		this.value = initializer.value;
	}

	/**
	 * Check if this type is a "true" literal.
	 */
	isTrue(): boolean
	{
		return this.kind === TypeKind.BooleanLiteral && this.value === "true";
	}

	/**
	 * Check if this type is a "false" literal.
	 */
	isFalse(): boolean
	{
		return this.kind === TypeKind.BooleanLiteral && this.value === "false";
	}
}