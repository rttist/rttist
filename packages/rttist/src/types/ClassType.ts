import type { AsyncCtorReference, ClassTypeMetadata } from "../declarations";
import { mapDecorators } from "../utils/mappers";
import type { TypeAliasType } from "./TypeAliasType";
import type { InterfaceType } from "./InterfaceType";
import type { Type } from "../Type";
import { DecoratorInfo, SignatureInfo } from "../infos";
import { LazyType } from "../utils/LazyType";
import { LazyTypeArray } from "../utils/LazyTypeArray";
import { ObjectLikeTypeBase } from "./ObjectLikeTypeBase";

export class ClassType extends ObjectLikeTypeBase {
	/** @internal */
	private readonly _implementsRef: LazyTypeArray<InterfaceType | TypeAliasType>;
	/** @internal */
	private readonly _ctor: AsyncCtorReference;
	// private readonly _ctorSync: SyncCtorReference;
	/** @internal */
	private readonly _constructors: ReadonlyArray<SignatureInfo>;
	/** @internal */
	private readonly _decorators: ReadonlyArray<DecoratorInfo>;
	/** @internal */
	private readonly _abstract: boolean;
	/** @internal */
	private readonly _extendsRef?: LazyType<ClassType>;

	/**
	 * Base type
	 * @description Base type from which this type extends from or undefined if type is Object.
	 */
	get extends(): ClassType | undefined {
		return this._extendsRef?.type;
	}

	/**
	 * Interface which this type implements
	 */
	get implements(): ReadonlyArray<InterfaceType | TypeAliasType> {
		return this._implementsRef.types;
	}

	/**
	 * Interface which this type implements
	 */
	get abstract(): boolean {
		return this._abstract;
	}

	constructor(initializer: ClassTypeMetadata) {
		super(initializer);

		this._ctor = initializer.ctor ?? (() => this.module.import().then((module) => module?.[initializer.name]));
		this._implementsRef = new LazyTypeArray<InterfaceType | TypeAliasType>(initializer.implements || []);
		this._extendsRef = initializer.extends === undefined ? undefined : new LazyType<ClassType>(initializer.extends);
		this._constructors = Object.freeze((initializer.constructors ?? []).map((meta) => new SignatureInfo(meta)));
		this._decorators = mapDecorators(initializer);
		this._abstract = initializer.abstract ?? false;
	}

	/**
	 * Constructor function in case Type is class.
	 */
	getCtor(): Promise<{ new (...args: any[]): any } | undefined> {
		return this._ctor();
	}

	/**
	 * Returns array of constructor signatures.
	 */
	getConstructors(): ReadonlyArray<SignatureInfo> {
		return this._constructors;
	}

	/**
	 * Returns array of decorators.
	 */
	getDecorators(): ReadonlyArray<DecoratorInfo> {
		return this._decorators;
	}

	/**
	 * Determines whether the class represented by the current Type derives from the class represented by the specified Type.
	 * @param {Type} classType
	 */
	isSubclassOf(classType: Type): boolean {
		return (
			classType.isClass() &&
			((this.extends !== undefined &&
				(this.extends.is(classType) ||
					(this.extends.isClass() && this.extends.isSubclassOf(classType)) ||
					(this.extends.isGenericType() &&
						this.extends.genericTypeDefinition.isClass() &&
						this.extends.genericTypeDefinition.isSubclassOf(classType)))) ||
				(this.isGenericType() &&
					(this.genericTypeDefinition.is(classType) ||
						(this.genericTypeDefinition?.isClass() && this.genericTypeDefinition.isSubclassOf(classType)))))
		);
	}

	/**
	 * Determines whether the current Type is derived from the specified targetType.
	 * @param {Type} targetType
	 */
	isDerivedFrom(targetType: Type): boolean {
		return (
			this.is(targetType) ||
			this.extends?.isDerivedFrom(targetType) ||
			this.implements.some((t) => (t.isInterface() ? t.isDerivedFrom(targetType) : t.is(targetType))) ||
			false
		);
	}
}
