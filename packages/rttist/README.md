# RTTIST
<sup><i>Pronounce /ˈɑː(r)tɪst/ the same like "Artist".</i> Means Run-Time Type Information System for Typescript.</sup>

> Advanced TypeScript runtime reflection system, inspired by the C#'s reflection.


## About
This project is all about runtime <strong>reflection</strong>. 
TypeScript itself contains rich type information but it is all dev time only. 
But TypeScript provide its compiler API, with access to type checker and ability to transform the code. 
Using this API we wrote a transformer plugin for TypeScript which generates runtime type information 
and modify your code slightly so you can reflect your types, even type parameters of classes, methods and functions.

For more information see our website [rttist.org](https://rttist.org) and docs [docs.rttist.org](https://docs.rttist.org).


## Showcase
[//]: # (TODO: List of StackBlitz examples)

```typescript
import { getType, Type, PropertyInfo, MethodInfo } from "rttist";

interface Employee {
    name: string;
    salary: number;
    sayHello();
    sayHello(toSomebody: string);
}

const type: Type = getType&lt;Employee>();

if (type.isInterface()) {
    const properties = type.getProperties().map((prop: PropertyInfo) => prop.name);
    const methods = type.getMethods().map((method: MethodInfo) => method.name);

    console.log(properties); // > [ name, salary ]
    console.log(methods); // > [ sayHello ]

    const sayHelloMethod: MethodInfo = type.getMethods().find(m => m.name === "sayHello");
    const signatures = sayHelloMethod.getSignatures()
        .map(sig => {
            const parameters = sig.getParameters()
                .map(param => param.name + ": " + param.type.name);

            return `sayHello(${parameters.join(", ")})`
        });

    console.log(signatures); // > [ sayHello(), sayHello(toSomebody: string) ]
}
```

## License
This project is licensed under the [MIT license](./LICENSE).
