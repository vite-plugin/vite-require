import type { AcornNode } from './types'
import { simpleWalk } from './utils'

export enum TopScopeType {
  // require('foo')[.bar]
  ExpressionStatement = 'ExpressionStatement',
  // const bar = rquire('foo')[.bar]
  VariableDeclaration = 'VariableDeclaration',
}

export interface RequireStatement {
  node: AcornNode
  ancestors: AcornNode[]
  dynamic?:
  | 'dynamic'
  // e.g. (Literal-like)
  //   require(`@/foo/bar.js`) 
  | 'dynamic-like'
  /**
   * If require statement located top-level scope and it is convertible, this will have a value(🎯-①)  
   * 如果 require 在顶级作用于，并且是可转换 import 的，那么 topScopeNode 将会被赋值  
   */
  topScopeNode?: AcornNode & { type: TopScopeType }
}

export interface Analyzed {
  ast: AcornNode
  code: string
  require: RequireStatement[]
}

/**
 * `require` statement analyzer  
 * require 语法分析器  
 */
export function analyze(ast: AcornNode, code: string): Analyzed {
  const analyzed: Analyzed = {
    ast,
    code,
    require: []
  }

  simpleWalk(ast, {
    CallExpression(node, ancestors) {
      if (node.callee.name !== 'require') return

      analyzed.require.push({
        node,
        ancestors,
        dynamic: checkDynamicId(node),
        topScopeNode: findTopLevelScope(ancestors) as RequireStatement['topScopeNode'],
      })
    },
    AssignmentExpression() {

    }
  })

  return analyzed
}

function checkDynamicId(node: AcornNode): RequireStatement['dynamic'] {
  // e.g. (Literal-like)
  //   require(`@/foo/bar.js`) 
  if (
    node.arguments[0]?.type === 'TemplateLiteral' &&
    node.arguments[0]?.quasis.length === 1
  ) {
    return 'dynamic-like'
  }
  // Only `require` with one-argument is supported
  return node.arguments[0]?.type !== 'Literal' ? 'dynamic' : null
}

// At present, only the "MemberExpression" of the one-depth is considered as the top-level scope
// 当前，只认为一层的 MemberExpression 顶级作用域
// e.g.
//   ✅ require('foo').bar
//   ❌ require('foo').bar.baz
//
// Will be return nearset scope ancestor node (🎯-①)
// 这将返回最近作用域的祖先节点
function findTopLevelScope(ancestors: AcornNode[]): AcornNode {
  const ances = ancestors.map(an => an.type).join()
  const arr = [...ancestors].reverse()

  if (/Program,ExpressionStatement,(MemberExpression,)?CallExpression$/.test(ances)) {
    // Program,ExpressionStatement,CallExpression                  | require('foo')
    // Program,ExpressionStatement,MemberExpression,CallExpression | require('foo').bar
    return arr.find(e => e.type === TopScopeType.ExpressionStatement)
  }

  // At present, "ancestors" contains only one depth of "MemberExpression"
  if (/Program,VariableDeclaration,VariableDeclarator,(MemberExpression,)?CallExpression$/.test(ances)) {
    // const bar = require('foo').bar
    // const { foo, bar: baz } = require('foo')
    return arr.find(e => e.type === TopScopeType.VariableDeclaration)
  }
}
