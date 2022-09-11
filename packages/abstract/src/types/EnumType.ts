import type {
	EnumTypeMetadata,
	TypeReference
}                           from "../declarations";
import type { LiteralType } from "./LiteralType";
import { Metadata }         from "../Metadata";
import { Type }             from "../Type";

export class EnumType extends Type
{
	private readonly _unionTypes: TypeReference[];
	private _entries?: Array<readonly [enumeratorName: string, value: any]>;

	constructor(initializer: EnumTypeMetadata)
	{
		super(initializer);
		this._unionTypes = initializer.types || [];
	}

	/**
	 * Get enum enumerators/items (keys).
	 */
	getEnumerators(): string[]
	{
		return this.getEntries().map(entry => entry[0]);
	}

	/**
	 * Get values.
	 */
	getValues(): any[]
	{
		return this.getEntries().map(entry => entry[1]);
	}

	/**
	 * Get enum entries (key:value pairs).
	 */
	getEntries(): Array<readonly [enumeratorName: string, value: any]>
	{
		return (
			this._entries ?? (this._entries = this._unionTypes.map(typeRef => {
				const type = Metadata.resolveType(typeRef) as LiteralType;
				return Object.freeze<readonly [enumeratorName: string, value: any]>([type.name, type.value]);
			}))
		).slice();
	}
}