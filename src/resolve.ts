import fs from 'fs'
import path from 'path'
import {
  type Alias,
  type ResolvedConfig,
  normalizePath,
} from 'vite'
import { parseId } from './utils'

export interface Resolved {
  type: 'alias' | 'bare'
  alias: Omit<Alias, 'customResolver'>
  import: {
    /** Always starts with alias or bare */
    importee: string
    importer: string
    /** Always relative path */
    resolved: string
  }
}

export class Resolve {

  constructor(
    private config: ResolvedConfig,
    private resolve = config.createResolver(),
  ) { }

  /**
   * Resolve the relative path of alias or bare(module)  
   * 解析 alias 或 bare(裸模块) 的相对路径  
   */
  public async tryResolve(importee: string, importer: string): Promise<Resolved | undefined> {
    return await this.tryResolveAlias(importee, importer) || this.tryResolveBare(importee, importer)
  }

  private async tryResolveAlias(importee: string, importer: string): Promise<Resolved> {
    const [, impt] = parseId(importee)

    // It may not be elegant here, just to look consistent with the behavior of the Vite
    // Maybe this means support for `alias.customResolver`
    const resolvedId = await this.resolve(impt, importer, true)
    if (!resolvedId) return

    const alias = this.config.resolve.alias.find(
      a => a.find instanceof RegExp
        ? a.find.test(impt)
        // https://github.com/rollup/plugins/blob/8fadc64c679643569239509041a24a9516baf340/packages/alias/src/index.ts#L16
        : impt.startsWith(a.find + '/')
    )
    if (!alias) return

    return {
      type: 'alias',
      ...this.resolveAlias(importee, importer, alias),
    }
  }

  private tryResolveBare(importee: string, importer: string): Resolved {
    const [, impt] = parseId(importee)

    // It's relative or absolute path
    if (/^[\.\/]/.test(impt)) {
      return
    }

    const paths = impt.split('/')
    const node_modules = path.join(this.config.root, 'node_modules')
    let level = ''
    let find: string, replacement: string

    // Find the last level of effective path step by step
    let p: string; while (p = paths.shift()) {
      level = path.join(level, p)
      const fullPath = path.join(node_modules, level)
      if (fs.existsSync(fullPath)) {
        find = level
        const normalId = normalizePath(importer)
        let relp = path.relative(path.dirname(normalId), node_modules)
        if (relp === '') {
          relp = '.'
        }
        replacement = relp + '/' + level
      }
    }
    if (!find) return

    // Fake the bare module of node_modules into alias, and `replacement` here is a relative path
    const alias: Alias = { find, replacement }
    return {
      type: 'bare',
      ...this.resolveAlias(importee, importer, alias)
    }
  }

  private resolveAlias(
    importee: string,
    importer: string,
    alias: Alias,
  ): Omit<Resolved, 'type'> {
    let [startQuotation, impt] = parseId(importee)
    const { find, replacement } = alias

    if (replacement.startsWith('.')) {
      // Relative path
      impt = impt.replace(find, replacement)
    } else {
      const normalId = normalizePath(importer)
      const normalReplacement = normalizePath(replacement)

      // Resolve relative path for compatible restrict of '@rollup/plugin-dynamic-import-vars'
      let relativePath = path.posix.relative(
        // Usually, the `replacement` we use is the directory path
        // So we also use the `path.dirname` path for calculation
        path.dirname(normalId),
        normalReplacement,
      )

      if (relativePath === '') {
        relativePath = '.'
      }
      const relativeImportee = relativePath + '/' + impt
        .replace(find, '')
        // Remove the beginning /
        .replace(/^\//, '')
      impt = relativeImportee
    }

    return {
      alias,
      import: {
        importee,
        importer,
        resolved: startQuotation + impt,
      },
    }
  }
}
