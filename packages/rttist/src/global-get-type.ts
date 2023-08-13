import { createGetTypeFunction } from "./get-type-factory";
import { GlobalMetadata } from "./global-library";

export const globalGetType = createGetTypeFunction(GlobalMetadata);
