import type { ObjectLikeBaseTypeMetadata } from "../declarations";
import {
	IndexInfo,
	MethodInfo,
	PropertyInfo
}                                          from "../infos";
import { Type }                            from "../Type";
import {
	mapIndexes,
	mapMethods,
	mapProperties
} from "../utils/mappers";

export abstract class ObjectLikeTypeBase extends Type
{
	private readonly _properties: ReadonlyArray<PropertyInfo>;
	private readonly _methods: ReadonlyArray<MethodInfo>;
	private readonly _indexes: ReadonlyArray<IndexInfo>;

	protected constructor(initializer: ObjectLikeBaseTypeMetadata)
	{
		super(initializer);
		this._properties = mapProperties(initializer);
		this._methods = mapMethods(initializer);
		this._indexes = mapIndexes(initializer);

		// @ts-ignore
		this._isIterable = this._properties
				?.some(prop => prop.name.isSymbol() && prop.name.name === Symbol.iterator)
			|| this._methods
				?.some(method => method.name.isSymbol() && method.name.name === Symbol.iterator);

		// this._isIterable = (initializer as ObjectLikeBaseTypeMetadata).methods
		// 		?.some(method => method.name.isString() && method.name.name === "next" && method.getSignatures().)
		// 	|| (initializer as ObjectLikeBaseTypeMetadata).properties
		// 		?.some(prop => prop.name.isString() && prop.name.name === "next");
	}

	/**
	 * Returns array of properties.
	 */
	getProperties(): ReadonlyArray<PropertyInfo>
	{
		return this._properties;
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
		return this._indexes;
	}

	/**
	 * Returns array of methods.
	 */
	getMethods(): ReadonlyArray<MethodInfo>
	{
		return this._methods;
	}

	/**
	 * Returns method matched by name.
	 */
	getMethod(name: string | number | symbol): MethodInfo | undefined
	{
		return this._methods.find(x => x.name.name === name);
	}
}