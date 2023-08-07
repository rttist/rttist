import type { EnumTypeMetadata } from "../declarations";
import type { MetadataLibrary } from "../Metadata";
import { Type } from "../Type";

export class EnumType extends Type {
	private readonly _entries: Array<readonly [enumeratorName: string, value: any]>;

	constructor(initializer: EnumTypeMetadata, metadataLibrary: MetadataLibrary) {
		super(initializer, metadataLibrary);

		this._entries = Object.entries(initializer.entries || {}).map(([name, value]) =>
			Object.freeze<readonly [enumeratorName: string, value: any]>([name, value])
		);
	}

	/**
	 * Get enum enumerators/items (keys).
	 */
	getEnumerators(): string[] {
		return this.getEntries().map((entry) => entry[0]);
	}

	/**
	 * Get values.
	 */
	getValues(): any[] {
		return this.getEntries().map((entry) => entry[1]);
	}

	/**
	 * Get enum entries (key:value pairs).
	 */
	getEntries(): Array<readonly [enumeratorName: string, value: any]> {
		return this._entries.slice();
	}
}
