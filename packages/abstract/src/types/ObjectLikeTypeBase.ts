import { MethodInfo } from "../declarations";
import type {
	PropertyInfo,
	IndexInfo,
	ObjectLikeBaseTypeMetadata
}                     from "../declarations";
import { Type }       from "../Type";

export abstract class ObjectLikeTypeBase extends Type
{
	private readonly _properties: ReadonlyArray<PropertyInfo>;
	private readonly _methods: ReadonlyArray<MethodInfo>;
	private readonly _indexes: ReadonlyArray<IndexInfo>;

	protected constructor(initializer: ObjectLikeBaseTypeMetadata)
	{
		super(initializer);
		this._properties = initializer.properties;
		this._methods = initializer.methods ?? [];
		this._indexes = initializer.indexes;
	}

	/**
	 * Returns array of properties.
	 */
	getProperties(): ReadonlyArray<PropertyInfo>
	{
		return this._properties.slice();
	}

	/**
	 * Returns property matched by name.
	 */
	getProperty(name: string | number | symbol): PropertyInfo | undefined
	{
		return this._properties.find(x => x.name.name === name);
	}

	/**
	 * Returns array of indexes.
	 */
	getIndexes(): ReadonlyArray<IndexInfo>
	{
		return this._indexes.slice();
	}

	/**
	 * Returns array of methods.
	 */
	getMethods(): ReadonlyArray<MethodInfo>
	{
		return this._methods.slice();
	}

	/**
	 * Returns method matched by name.
	 */
	getMethod(name: string | number | symbol): MethodInfo | undefined
	{
		return this._methods.find(x => x.name.name === name);
	}
}