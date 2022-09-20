import type {
	AsyncCtorReference,
	ClassTypeMetadata,
	DecoratorInfo,
	Signature
}                                       from "../declarations";
import type { GenericType }             from "./GenericType";
import type { InterfaceType }           from "./InterfaceType";
import type { TypeAliasType }           from "./TypeAliasType";
import { LazyType }                     from "../utils/LazyType";
import { Type }                         from "../Type";
import { ExtendableObjectLikeTypeBase } from "./ExtendableObjectLikeTypeBase";

export class ClassType extends ExtendableObjectLikeTypeBase
{
	// private readonly _interfaceReference?: TypeReference;

	/** @internal */
	private readonly _interface?: LazyType<InterfaceType | TypeAliasType>;
	/** @internal */
	private readonly _ctor: AsyncCtorReference;
	// private readonly _ctorSync: SyncCtorReference;
	/** @internal */
	private readonly _constructors: ReadonlyArray<Signature>;
	/** @internal */
	private readonly _decorators: ReadonlyArray<DecoratorInfo>;

	/**
	 * Interface which this type implements
	 */
	get interface(): InterfaceType | TypeAliasType | undefined
	{
		return this._interface?.type;
	}

	constructor(initializer: ClassTypeMetadata)
	{
		super(initializer);

		this._ctor = initializer.ctor;
		this._interface = initializer.interface !== undefined
			? new LazyType<InterfaceType | TypeAliasType>(initializer.interface)
			: undefined;
		this._constructors = Object.freeze(initializer.constructors ?? []);
		this._decorators = Object.freeze(initializer.decorators ?? []);
	}

	/**
	 * Constructor function in case Type is class.
	 */
	getCtor(): Promise<{ new(...args: any[]): any } | undefined>
	{
		return this._ctor?.() ?? Promise.resolve(undefined);
	}

	/**
	 * Returns array of constructor signatures.
	 */
	getConstructors(): ReadonlyArray<Signature>
	{
		return this._constructors;
	}

	/**
	 * Returns array of decorators.
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo>
	{
		return this._decorators;
	}

	/**
	 * Determines whether the class represented by the current Type derives from the class represented by the specified Type.
	 * @param {Type} classType
	 */
	isSubclassOf(classType: Type): boolean
	{
		return classType.isClass() && (
			(this.baseType !== undefined && (
				this.baseType.is(classType)
				|| (
					this.baseType.isClass()
					&& this.baseType.isSubclassOf(classType)
				)
				|| (
					this.baseType.isGenericType()
					&& this.baseType.genericTypeDefinition.isClass()
					&& this.baseType.genericTypeDefinition.isSubclassOf(classType)
				)
			))
			|| (this.isGenericType() && (
				this.genericTypeDefinition.is(classType)
				|| (
					this.genericTypeDefinition?.isClass()
					&& this.genericTypeDefinition.isSubclassOf(classType)
				)
			))
		);
	}

	/**
	 * Determines whether the current Type derives from the specified Type.
	 * @param {Type} targetType
	 */
	isDerivedFrom(targetType: Type): boolean
	{
		if (super.isDerivedFrom(targetType))
		{
			return true;
		}

		if (this.interface !== undefined)
		{
			const ifce = this.interface.isTypeAlias()
				? this.interface.target as InterfaceType
				: this.interface;

			return ifce.isDerivedFrom(targetType);
		}

		return false;
	}
}