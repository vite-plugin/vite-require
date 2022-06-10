import path from 'path'
import fastGlob from 'fast-glob'
import { type ResolvedConfig } from 'vite'
import { type Analyzed } from './analyze'
import { type Resolved, Resolve } from './resolve'
import { type Options } from './index'
import { dynamicImportToGlob } from './dynamic-import-to-glob'
import { MagicString } from './utils'

/**
 * ```
 * At present, divide `require` into three cases
 * 目前，将 require() 分为三种情况
 * 
 * ①:
 * In the top-level scope and can be converted to `import` directly (🎯-①)
 * 在顶层作用域，并且直接转换成 import
 * 
 * ②:
 * If the `id` in `require(id)` is a literal string, the `require` statement will be promoted to the top-level scope and become an `import` statement (🚧-①)
 * 如果 require(id) 中的 id 是字面量字符串，require 语句将会被提升到顶级作用域，变成 import 语句
 * 
 * ③:
 * If the `id` in `require(id)` is a dynamic-id, the `require` statement will be converted to `__variableDynamicImportRuntime` function (🚧-②)
 * 如果 require(id) 中的 id 动态 id，require 语句将会被转换成 __variableDynamicImportRuntime 函数
 * ```
 */

export class DynamicRequire {
  private EXT = '.extension'

  constructor(
    private options: Options,
    private config: ResolvedConfig,
    private resolve = new Resolve(config),
  ) { }

  public async transform(analyzed: Analyzed, importer: string): Promise<string> {
    const { code, require: statements } = analyzed
    const ms = new MagicString(code)
    const imptPromote: { [id: string]: string } = {} // import-id, import-name
    let counter = 0

    for (const statement of statements) {
      const {
        node,
        ancestors,
        isDynamicId,
        topScopeNode,
      } = statement
      counter++

      if (isDynamicId) {
        let resolved: Resolved
        let glob = await dynamicImportToGlob(
          // `require` should have only one parameter
          node.arguments[0],
          code.slice(node.start, node.end),
          async (_glob) => {

            // It's relative or absolute path
            if (/^[\.\/]/.test(_glob)) {
              return
            }

            resolved = await this.resolve.tryResolve(_glob, importer)
            if (!resolved) return

            _glob = resolved.import.resolved

            // EXT for bypass restrict
            return path.extname(_glob) ? _glob : _glob + this.EXT
          },
        )
        if (!glob) return

        glob = tryFixGlobSlash(glob)
        this.options.depth !== false && (glob = toDepthGlob(glob))

        let fileGlob: string
        if (glob.endsWith(this.EXT)) {
          glob = glob.replace(this.EXT, '')
          // If not ext is not specified, fill necessary extensions
          // e.g.
          //   `./foo/*` -> `./foo/*.{js,ts,vue,...}`
          fileGlob = glob + `.{${this.options.extensions.map(e => e.replace(/^\./, '')).join(',')}}`
        } else {
          fileGlob = glob
        }

        const result = fastGlob.sync(fileGlob, { cwd: path.dirname(importer) })
        let paths = result.map(file => !file.startsWith('.') ? `./${file}` : file)
        // TODO: execute the Options.onFiles

        if (!paths.length) continue

        const entries: Record</* localFilename */string, /* Array<possible importee> */string[]> = {}
        for (const p of paths) {
          let importee = p
          if (resolved) {
            const static1 = resolved.import.importee.slice(0, resolved.import.importee.indexOf('*'))
            const static2 = resolved.import.resolved.slice(0, resolved.import.resolved.indexOf('*'))
            // Recovery alias `./views/*` -> `@/views/*`
            importee = p.replace(static2, static1)
          }
          const ext = path.extname(importee)

          entries[p] = [importee.replace(ext, ''), importee]
          if (importee.endsWith(`/index${ext}`)) {
            entries[p].unshift(importee.replace(`/index${ext}`, ''))
          }
        }

        const runtimeFnName = `__matchRequireRuntime${counter}__`
        let counter2 = 0
        let cases = ''
        for (const [localFile, importeeList] of Object.entries(entries)) {
          let importName: string
          const cache = imptPromote[localFile]
          if (cache) {
            importName = cache
          } else {
            importName = importName = `__CJS_import__${counter}__${counter2++}`
            imptPromote[localFile] = importName
          }
          cases += importeeList
            .map(importee => `    case '${importee}':`)
            .concat(`      return ${importName};\n`)
            .join('\n')
        }
        ms.overwrite(node.callee.start, node.callee.end, runtimeFnName)
        ms.append(`function ${runtimeFnName}(path) {
  switch(path) {
${cases}
    default: throw new Error("Cann't found module: " + path);
  }
}
`)
      }
    }

    const promotionImports = Object.entries(imptPromote)
      .map(([id, name]) => `import * as ${name} from '${id}';`)
    if (promotionImports.length) {
      ms.prepend([
        '/* import-promotion-S */',
        ...promotionImports,
        '/* import-promotion-E */',
      ].join(' '))
    }

    const str = ms.toString()
    return str === code ? null : str
  }
}

// In some cases, glob may not be available
// e.g. (fill necessary slash)
//   `./foo*` -> `./foo/*`
//   `./foo*.js` -> `./foo/*.js`
function tryFixGlobSlash(glob: string): string {
  return glob.replace(/(?<![\*\/])(\*)/g, '/$1')
}

// Match as far as possible
// e.g.
//   `./foo/*` -> `./foo/**/*`
//   `./foo/*.js` -> `./foo/**/*.js`
function toDepthGlob(glob: string): string {
  return glob.replace(/^(.*)\/\*(?!\*)/, '$1/**/*')
}
