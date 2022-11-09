# Usage With Vanilla TypeScript

1. Install packages,
```
npm i rttist && npm i tst-reflect-transformer -D
```
2. add transformer to `tsconfig.json`,
```json5
{
    "compilerOptions": {
        // your options...

        // ADD THIS!
        "plugins": [
            {
                "transform": "tst-reflect-transformer"
            }
        ]
    }
}
```
2. `npm i ttypescript -D`
> In order to use transformer plugin you need TypeScript compiler which supports plugins eg. package [ttypescript](https://www.npmjs.com/package/ttypescript) or you can use [TypeScript compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) manually.
3. Now just transpile your code by `ttsc` instead of `tsc`
```
ttsc
```
or
```
npx ttsc
```