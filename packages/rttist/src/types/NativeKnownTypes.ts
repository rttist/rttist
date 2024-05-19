import type { Type } from "../Type";
import { KnownGenericType } from "./KnownGenericType";
import { TypeMetadata } from "../declarations";
import { TypeIds } from "@rttist/core";

export class PromiseType extends KnownGenericType<readonly [Type]> {
	constructor(initializer: TypeMetadata) {
		super(TypeIds.PromiseDefinition, initializer);
	}
}

export class ArrayType extends KnownGenericType<readonly [Type]> {
	constructor(initializer: TypeMetadata) {
		super(TypeIds.ArrayDefinition, initializer);
	}
}

export class ReadonlyArrayType extends KnownGenericType<readonly [Type]> {
	constructor(initializer: TypeMetadata) {
		super(TypeIds.ReadonlyArrayDefinition, initializer);
	}
}

export class SetType extends KnownGenericType<readonly [Type]> {
	constructor(initializer: TypeMetadata) {
		super(TypeIds.SetDefinition, initializer);
	}
}

export class WeakSetType extends KnownGenericType<readonly [Type]> {
	constructor(initializer: TypeMetadata) {
		super(TypeIds.WeakSetDefinition, initializer);
	}
}

export class MapType extends KnownGenericType<readonly [Type, Type]> {
	constructor(initializer: TypeMetadata) {
		super(TypeIds.MapDefinition, initializer);
	}
}

export class WeakMapType extends KnownGenericType<readonly [Type, Type]> {
	constructor(initializer: TypeMetadata) {
		super(TypeIds.WeakMapDefinition, initializer);
	}
}

export class TupleType extends KnownGenericType<readonly Type[]> {
	constructor(initializer: TypeMetadata) {
		super(TypeIds.TupleDefinition, initializer);
	}
}
