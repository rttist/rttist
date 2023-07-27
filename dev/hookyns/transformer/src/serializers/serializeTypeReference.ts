import { TransformerTypeReference } from "../declarations/TransformerTypeReference";
import { encodeString }             from "../types/encodeString";

export function serializeTypeReference(ref: TransformerTypeReference)
{
	if (ref.isKindOnly())
	{
		return [1, ref.nativeReference.kind];
	}
	else
	{
		return [0, ...encodeString(ref.id), 0];
	}
}