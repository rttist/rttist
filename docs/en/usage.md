## How to Get a Type
Use function `getType<TType>(runtimeValue?: any): Type` from native `Reflect` namespace; extended by package `rttist`.
```typescript
type Alias = string | boolean;
interface Ifce {}
class Cls {}
function func() {}

Reflect.getType<Alias>();
Reflect.getType<Ifce>();
Reflect.getType<Cls>();
Reflect.getType<typeof func>();

const cls = new Cls();
Reflect.getType(cls);
Reflect.getType(Cls);
Reflect.getType(func);
Reflect.getType("some string or any other runtime value");

// Reflection over Type parameters
class Generic<TType> {
	constructor() {
		Reflect.getType<TType>();
	}
	
	method<TMeth>() {
		Reflect.getType<TType>();
		Reflect.getType<TMeth>();
	}
}
```