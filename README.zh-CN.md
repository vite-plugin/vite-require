# vite-require

类似于 Webpack's 中的 require

[![NPM version](https://img.shields.io/npm/v/vite-require.svg)](https://npmjs.org/package/vite-require)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-require.svg)](https://npmjs.org/package/vite-require)

[English](https://github.com/vite-plugin/vite-require#readme) | 简体中文

✅ dynamic-require 和 👉 [Webpack](https://webpack.js.org/guides/dependency-management/#require-with-expression) `require('./foo/' + bar)`类似

📦 开箱即用

🔨 只在 `vite serve` 阶段起作用 


## 安装

```bash
npm i vite-require -D
```

## 使用

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
