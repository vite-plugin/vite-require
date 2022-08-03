# vite-require

Like Webpack's require

[![NPM version](https://img.shields.io/npm/v/vite-require.svg)](https://npmjs.org/package/vite-require)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-require.svg)](https://npmjs.org/package/vite-require)

English | [简体中文](https://github.com/vite-plugin/vite-require/blob/main/README.zh-CN.md)

✅ dynamic-require similar to 👉 [Webpack](https://webpack.js.org/guides/dependency-management/#require-with-expression) `require('./foo/' + bar)`

📦 Out of the box  

🔨 Work only in the `vite serve` phase  

## Install

```bash
npm i vite-require -D
```

## Usage

```js
import { viteRequire } from 'vite-require'
export default {
  plugins: [
    viteRequire(/* options */)
  ]
}
```

## API

viteRequire([options])

```ts
export interface Options {
  extensions?: string[]
  filter?: (id: string) => false | void
  dynamic?: {
    /**
     * 1. `true` - Match all possibilities as much as possible, More like `webpack`
     * 2. `false` - It behaves more like `@rollup/plugin-dynamic-import-vars`
     * @default true
     */
    loose?: boolean
  }
}
```
