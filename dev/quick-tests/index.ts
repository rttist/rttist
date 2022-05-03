import {
	Type,
	TypeKind
}                   from "@rtti/abstract";
import { getType }  from "tst-reflect";
import { SomeEnum } from "./SomeEnum";
import { SomeType } from "./SomeType";

getType<number>();

type Obj = { foo: string, bar: Obj };
type ObjAlias = Obj;
getType<Obj>();
getType<Obj>();
getType<ObjAlias>();
getType<{ foo: string, bar: number }>();
getType<SomeType>();