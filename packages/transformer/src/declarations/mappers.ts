import * as ts            from "typescript";
import { Context }        from "../contexts/Context";
import { TypeProperties } from "./TypeProperties";

export type TypeMapperResult = TypeProperties | undefined;
export type TypeMapper = (type: ts.Type, context: Context) => TypeMapperResult;