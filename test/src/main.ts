const foo_foo = require('./foo/foo')
const { msg: baz_msg } = require('@/foo/baz')
const bar_bar_msg = require('@/foo/bar/bar').msg

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`

function loadFile(f: string) {
  return require(`@/foo/${f}`)
}

function loadAssets(a: string) {
  // TODO: require(`./assets/${a}`)
  return require(`@/assets/${a}`)
}

console.log(foo_foo)
console.log(baz_msg)
console.log(bar_bar_msg)
console.log(loadFile('foo').msg)
console.log(loadAssets('vite.svg'))
