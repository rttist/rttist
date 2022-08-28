import {} from "@rtti/abstract";
import { SomeType } from "./SomeType";

Reflect.getType<number>();

type Obj = { foo: string, bar: Obj };
type ObjAlias = Obj;
Reflect.getType<Obj>();
Reflect.getType<Obj>();
Reflect.getType<ObjAlias>();
Reflect.getType<{ foo: string, bar: number }>();
Reflect.getType<SomeType>();