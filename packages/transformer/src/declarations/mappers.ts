import type * as ts            from "typescript";
import type { Context }        from "../contexts/Context";
import type { TypeProperties } from "./TypeProperties";

export type TypeMapperResult = TypeProperties | undefined;
export type TypeMapper = (type: ts.Type, symbol: ts.Symbol | undefined, context: Context) => TypeMapperResult;