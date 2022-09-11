import type {
	AsyncCtorReference,
	ClassTypeMetadata,
	DecoratorInfo,
	TypeReference,
	Signature
}                                       from "../declarations";
import type { GenericType }             from "./GenericType";
import { Metadata }                     from "../Metadata";
import { Type }                         from "../Type";
import { ExtendableObjectLikeTypeBase } from "./ExtendableObjectLikeTypeBase";

export class ClassType extends ExtendableObjectLikeTypeBase
{
	private readonly _interfaceReference?: TypeReference;

	private _interface?: Type;
	private readonly _ctor: AsyncCtorReference;
	// private readonly _ctorSync: SyncCtorReference;
	private readonly _constructors: ReadonlyArray<Signature>;
	private readonly _decorators: ReadonlyArray<DecoratorInfo>;

	/**
	 * Interface which this type implements
	 */
	get interface(): Type | undefined
	{
		if (!this._interfaceReference)
		{
			return undefined;
		}

		return this._interface ?? (this._interface = Metadata.resolveType(this._interfaceReference));
	}

	constructor(initializer: ClassTypeMetadata)
	{
		super(initializer);

		this._ctor = initializer.ctor;
		this._interfaceReference = initializer.interface;
		this._constructors = Object.freeze(initializer.constructors ?? []);
		this._decorators = Object.freeze(initializer.decorators ?? []);
	}

	/**
	 * @inheritDoc
	 */
	isGenericType(): this is GenericType<ClassType>
	{
		return super.isGenericType();
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
		return classType.isClass() && this.baseType !== undefined
			&& (
				this.baseType.is(classType)
				|| (
					this.baseType.isClass()
					&& this.baseType.isSubclassOf(classType)
				)
			);
	}

	/**
	 * Determines whether the current Type derives from the specified Type.
	 * @param {Type} targetType
	 */
	isDerivedFrom(targetType: Type): boolean
	{
		return super.isDerivedFrom(targetType)
			// || this.interface?.isAssignableTo(targetType) // TODO: Solve.
			|| false;
	}
}