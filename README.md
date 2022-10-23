[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)
![Code coverage](docs/_images/coverage-badge.svg)<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-12-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

# RTTIST
<sup><i>Pronounce /ˈɑː(r)tɪst/ the same as Artist.</i> Means Run-Time Type Information System for Typescript.</sup>

> Advanced TypeScript runtime reflection system, inspired by the C#'s reflection.


<center style="float:left">

![Reflect](docs/_images/logo_256_flat.png)
</center>


## About
<p style="text-align: justify">
This project is all about runtime <strong>reflection</strong>. 
TypeScript itself contains rich type information but it is all dev time only. 
But TypeScript provide its compiler API, with access to type checker and ability to transform the code. 
Using this API we wrote a transformer plugin for TypeScript which generates runtime type information 
and modify your code slightly so you can reflect your types, even type parameters of classes, methods and functions.
</p>

<p style="clear: both;"></p>

## Features

- Regular TypeScript, no annotations required to use the reflection,
- generate metadata of modules and types,
- dynamic imports of reflected types,
- no problem with types from 3rd party packages,
- reflection over classes, interfaces, type aliases, unions, intersections, just all of that,
- reflection over runtime values (eg. get type of class' instance),
- reflection over type parameters (function, method and class type parameters supported)
- overloads of constructors, methods and functions supported,
- reflection inside custom decorators,
- check if one type is assignable to another without instances of those type,
- static metadata library to lookup types and modules,
- Plugins! You can write custom transformer plugin which will be executed in our context so you will have access to all the types. You can change them or just use them for something,
- browser usage,
- CJS & ESM,
- but no pre-implemented features like validators or automatic type-guards!

## Showcase
[//]: # (TODO: List of StackBlitz examples)

```typescript
import { Type } from "rttist";

abstract class AwesomeFeature {
  protected constructor(protected isCool: boolean) {}
}

class TypeScriptRuntimeReflection<TProps> extends AwesomeFeature {
  like = ".NET";
  props?: TProps;

  constructor(isCool: boolean)
  constructor(isCool: boolean, props: TProps)
  constructor(isCool: boolean, props?: TProps) {
    super(isCool);
    this.props = props;
  }
}

// Here we have some function with type parameter
function printTypeInfo<TType>() {
  const type: Type = Reflect.getType<TType>(); // getting the type passed as type argument

  console.log(`
    Type name: ${type.name}, extends: ${type.baseType.name}
      Constructors:`,
        type.getConstructors().map(ctor => ctor.getParameters().map(param => `${param.name}: ${param.type.name}`)), `
      Properties:`,
        type.getProperties().map(prop => `${prop.name}: ${prop.type.name}`)
  );
}

printTypeInfo<AwesomeFeature>();
printTypeInfo<TypeScriptRuntimeReflection<{}>>();
```


## Contributors ✨

Thanks go to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://bitbucket.org/HookCZ/"><img src="https://avatars.githubusercontent.com/u/2551259?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roman Jámbor</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/commits?author=Hookyns" title="Code">💻</a> <a href="#maintenance-Hookyns" title="Maintenance">🚧</a> <a href="https://github.com/Hookyns/tst-reflect/commits?author=Hookyns" title="Documentation">📖</a> <a href="https://github.com/Hookyns/tst-reflect/pulls?q=is%3Apr+reviewed-by%3AHookyns" title="Reviewed Pull Requests">👀</a> <a href="#example-Hookyns" title="Examples">💡</a> <a href="#ideas-Hookyns" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-Hookyns" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#question-Hookyns" title="Answering Questions">💬</a> <a href="https://github.com/Hookyns/tst-reflect/commits?author=Hookyns" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/iDevelopThings"><img src="https://avatars.githubusercontent.com/u/4105581?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sam Parton</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/commits?author=iDevelopThings" title="Code">💻</a> <a href="https://github.com/Hookyns/tst-reflect/issues?q=author%3AiDevelopThings" title="Bug reports">🐛</a> <a href="#ideas-iDevelopThings" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://filmos.net/"><img src="https://avatars.githubusercontent.com/u/78136833?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Filmos</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/issues?q=author%3AFilmos" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://dunglas.fr/"><img src="https://avatars.githubusercontent.com/u/57224?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kévin Dunglas</b></sub></a><br /><a href="#ideas-dunglas" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/usaccounts"><img src="https://avatars.githubusercontent.com/u/12177064?v=4?s=100" width="100px;" alt=""/><br /><sub><b>usaccounts</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/issues?q=author%3Ausaccounts" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/caiodallecio"><img src="https://avatars.githubusercontent.com/u/20131875?v=4?s=100" width="100px;" alt=""/><br /><sub><b>caiodallecio</b></sub></a><br /><a href="#ideas-caiodallecio" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/hugebdu"><img src="https://avatars.githubusercontent.com/u/1109601?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Shmuglin</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/issues?q=author%3Ahugebdu" title="Bug reports">🐛</a> <a href="#ideas-hugebdu" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/avin-kavish"><img src="https://avatars.githubusercontent.com/u/48435155?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Avin</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/issues?q=author%3Aavin-kavish" title="Bug reports">🐛</a> <a href="https://github.com/Hookyns/tst-reflect/commits?author=avin-kavish" title="Code">💻</a></td>
    <td align="center"><a href="http://joeferner.github.io/"><img src="https://avatars.githubusercontent.com/u/808857?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joe Ferner</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/commits?author=joeferner" title="Code">💻</a></td>
    <td align="center"><a href="https://dhkatz.dev"><img src="https://avatars.githubusercontent.com/u/8341611?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David Katz</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/issues?q=author%3Adhkatz" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://experimental-learning.com/"><img src="https://avatars.githubusercontent.com/u/58147075?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jamesb &#124; Experimental Learning</b></sub></a><br /><a href="https://github.com/Hookyns/tst-reflect/issues?q=author%3Abjsi" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/carloszimmerle/"><img src="https://avatars.githubusercontent.com/u/4553211?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Carlos Zimmerle</b></sub></a><br /><a href="#ideas-carloszimm" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Hookyns/tst-reflect/issues?q=author%3Acarloszimm" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://allcontributors.org) specification.
Contributions of any kind are welcome!

## License
This project is licensed under the [MIT license](./LICENSE).
