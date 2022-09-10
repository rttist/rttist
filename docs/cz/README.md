[![tst-reflect](https://img.shields.io/npm/v/tst-reflect.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect)](https://www.npmjs.com/package/tst-reflect)
[![tst-reflect-transformer](https://img.shields.io/npm/v/tst-reflect-transformer.svg?color=brightgreen&style=flat-square&logo=npm&label=tst-reflect-transformer)](https://www.npmjs.com/package/tst-reflect-transformer)
[![License MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](https://opensource.org/licenses/MIT)
![Code coverage](../coverage/badge.svg)<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-12-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

# RTTIST
<sup><i>Výslovnost /ˈɑː(r)tɪst/, stejně jako Artist.</i> Zkratka znamená Run-Time Type Information System for Typescript.</sup>

> Advanced TypeScript runtime reflection system, inspired by the C#'s reflection.


<center style="float:left">

![Reflect](../_images/logo_256_flat.png)
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

> Česká dokumentace zatím chybí. Můžete ji ale doplnit; stačí vytvořit PR.