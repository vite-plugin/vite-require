import path from 'path'
import {
  type Plugin,
  type ResolvedConfig,
} from 'vite'
import {
  cleanUrl,
  isCommonjs,
  JS_EXTENSIONS,
  KNOWN_ASSET_TYPES,
  KNOWN_CSS_TYPES,
  KNOWN_SFC_EXTENSIONS,
} from './utils'
import { analyze } from './analyze'
import { DynamicRequire } from './dynamic-require'

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

export function viteRequire(options: Options = {}): Plugin {
  const extensions = JS_EXTENSIONS
    .concat(KNOWN_SFC_EXTENSIONS)
    .concat(KNOWN_ASSET_TYPES)
    .concat(KNOWN_CSS_TYPES)
  let config: ResolvedConfig
  let dynamicRequire: DynamicRequire

  return {
    name: 'vite-require',
    configResolved(_config) {
      config = _config
      options.extensions = [...new Set((config.resolve?.extensions || extensions).concat(options.extensions || []))]
      dynamicRequire = new DynamicRequire(options, _config)
    },
    transform(code, id) {
      const pureId = cleanUrl(id)

      if (/node_modules\/(?!\.vite\/)/.test(pureId)) return
      if (!extensions.includes(path.extname(pureId))) return
      if (!isCommonjs(code)) return
      if (options.filter?.(pureId) === false) return

      const ast = this.parse(code)
      const analyzed = analyze(ast, code)
      if (!analyzed.require.length) return

      return dynamicRequire.transform(analyzed, id)
    },
  }
}
