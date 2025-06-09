import type { TypeReference } from "../declarations";
import { TypeIds } from "@rttist/core";

export function* invalidTypeGenerator(): Generator<TypeReference, void, unknown> {
	for (let i = 0; i < 100; i++) {
		yield TypeIds.Invalid;
	}
}
