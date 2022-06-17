# vite-require

Like Webpack's require

[![NPM version](https://img.shields.io/npm/v/vite-require.svg)](https://npmjs.org/package/vite-require)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-require.svg?style=flat)](https://npmjs.org/package/vite-require)

English | [简体中文](https://github.com/vite-plugin/vite-require/blob/main/README.zh-CN.md)

✅ dynamic-require `require('./foo/' + bar)`  

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
  /**
   * When use the dynamic-require, this option will change `./*` to `./** /*`
   * @default true
   */
  depth?: boolean
}
```
