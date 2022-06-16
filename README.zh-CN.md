# vite-require

类似于 Webpack's 中的 require

[![NPM version](https://img.shields.io/npm/v/vite-require.svg)](https://npmjs.org/package/vite-require)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-require.svg?style=flat)](https://npmjs.org/package/vite-require)

[English](https://github.com/vite-plugin/vite-require#readme) | 简体中文

✅ dynamic-require `require('./foo/' + bar)`  

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
  /**
   * When use the dynamic-require, this option will change `./*` to `./** /*`
   * @default true
   */
  depth?: boolean
}
```
