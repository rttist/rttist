import type * as ts from "typescript";
import { Context } from "../lib/transformer/contexts/context";
import { TypeProperties } from "./type-properties";

export type TypeMapperResult = TypeProperties | undefined;
export type TypeMapper = (type: ts.Type, symbol: ts.Symbol | undefined, context: Context) => TypeMapperResult;
