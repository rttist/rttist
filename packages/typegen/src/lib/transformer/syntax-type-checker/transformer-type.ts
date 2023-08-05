import { TypeIds } from "@rttist/core";
import { TypeIdentifier } from "rttist";

export class TransformerType {
	public static readonly Invalid = new TransformerType(TypeIds.Invalid);
	public static readonly Any = new TransformerType(TypeIds.Any);
	public static readonly Void = new TransformerType(TypeIds.Void);

	public readonly id: TypeIdentifier;

	constructor(id: TypeIdentifier) {
		this.id = id;
	}
}
